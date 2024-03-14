import { Request, NextFunction, Response } from 'express';
import Status, { getReasonPhrase } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Role } from '../entities/Role';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

const _SecretToken = process.env.JWT_SECRET || '';
const _TokenExpiryTime = '1h';

interface Token {
    id: string;
    username: string;
    email: string;
    role: Array<Role>;
}

// Checks whether the user is logged in and has all the required perms
export const defaultAuthHandler = (requiredPerms: Array<string>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (req: Request, res: Response, next: NextFunction) => {
        function sendError(msg: string) {
            return req.res.status(Status.UNAUTHORIZED).json({
                status_code: Status.UNAUTHORIZED,
                error: getReasonPhrase(Status.UNAUTHORIZED),
                message: msg
            });
        }

        try {
            const token = req.headers['Authorization'] || req.headers['authorization'];

            if (!token) return sendError('Not logged in'); // Token does not exist
            if (token.indexOf('Bearer') !== 0) return sendError('Error: Token format invalid'); // Wrong format

            const tokenString = (token as string).split(' ')[1];

            jwt.verify(tokenString, _SecretToken, async (err, decodedToken: Token) => {
                if (err) {
                    return sendError('Error: Broken Or Expired Token. Please log in again.');
                }

                if (!(decodedToken as Token).role) return sendError('Error: Role missing');
                // This is a list of Role objects, each with different overlapping permissions
                // const userRoles: Array<Role> = decodedToken.role as unknown as Array<Role>;
                // Fetch the role from the DB to check if the perms have been updated
                const userFromDB = await AppDataSource.manager.find(User, {
                    where: { id: Number(decodedToken.id) },
                    relations: { role: true }
                });
                if (!userFromDB[0]) {
                    return sendError('Invalid user');
                }
                if (!userFromDB[0]?.role) {
                    return sendError('Error: Role missing');
                }

                const userRoles: Array<Role> = userFromDB[0].role;
                // We want to condense it into a list of permissions
                const userPerms: Array<string> = [];
                userRoles.forEach((element: Role) => {
                    const rolePerms = JSON.parse(element.permissions);
                    for (const perm of rolePerms) {
                        if (!userPerms.includes(perm)) {
                            userPerms.push(perm);
                        }
                    }
                });
                for (const requiredPerm of requiredPerms) {
                    if (userPerms.indexOf(requiredPerm) === -1) {
                        return sendError('Error: User not authorized');
                    }
                }
                // req.headers['x-user'] = JSON.stringify(decodedToken);
                next();
            });
        } catch (err) {
            return req.res.json({ message: 'Server Error Occured' });
        }
    };
};

export function issueToken(user: any) {
    var token = jwt.sign({ ...user, iss: 'app' }, _SecretToken, {
        expiresIn: _TokenExpiryTime
    });
    return token;
}

export const RoutePermissions = {
    // Basic perms for inventory
    view: 'view',
    create: 'create',
    update: 'update',
    delete: 'delete',

    // Elevated perms for user and role management
    user: 'user',
    roles: 'roles'
};

export const DefaultRolePermissions = {
    Viewer: [RoutePermissions.view],
    Editor: [RoutePermissions.view, RoutePermissions.create, RoutePermissions.update],
    Janitor: [RoutePermissions.view, RoutePermissions.delete],
    Admin: [RoutePermissions.view, RoutePermissions.create, RoutePermissions.update, RoutePermissions.delete],
    Superadmin: [
        RoutePermissions.view,
        RoutePermissions.create,
        RoutePermissions.update,
        RoutePermissions.delete,
        RoutePermissions.user,
        RoutePermissions.roles
    ]
};
