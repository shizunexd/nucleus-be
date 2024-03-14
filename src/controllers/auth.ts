import {
    controller,
    httpGet,
    BaseHttpController,
    requestParam,
    requestBody,
    httpPost,
    httpPatch
} from 'inversify-express-utils';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { defaultAuthHandler, issueToken, RoutePermissions } from '../middlewares/default-auth';
import ClientError from '../errors/client-error';
import ServerError from '../errors/server-error';

/* eslint class-methods-use-this: 0 */

interface RoleBody {
    name: string;
    permissions: Array<string>;
}

@controller('/auth')
export class AuthController extends BaseHttpController {
    @httpPost('/create-user', defaultAuthHandler([RoutePermissions.user, RoutePermissions.roles]))
    async createUser(@requestBody() payload: any) {
        const { email, password, role, username } = payload;

        try {
            await bcrypt.hash(password, 10).then(async function (hashedPassword: string) {
                const insertData = { username, email, password: hashedPassword, role };
                try {
                    await AppDataSource.manager.save(User, insertData);
                    return { status: 'created' };
                } catch (e) {
                    return new ServerError(e);
                }
            });
        } catch (e) {
            return new ServerError(e);
        }
    }

    @httpGet('/get-users', defaultAuthHandler([RoutePermissions.user]))
    async getUser() {
        const result = await AppDataSource.manager.find(User, {
            relations: {
                role: true
            }
        });
        return { status: 'OK', data: result };
    }

    @httpGet('/get-roles', defaultAuthHandler([RoutePermissions.user]))
    async getRoles() {
        const result = await AppDataSource.manager.find(Role, {});
        return { status: 'OK', data: result };
    }

    @httpPatch('/update-user/:id', defaultAuthHandler([RoutePermissions.user]))
    async updateUser(@requestParam('id') userId: string, @requestBody() payload: any) {
        let user = new User();
        user = Object.assign(user, payload);
        user.id = Number(userId);
        let roles: Array<Role> = [];
        if (payload.role) {
            payload.role.forEach((r: number) => {
                const userRole = new Role();
                userRole.id = r;
                roles.push(userRole);
            });
        }
        user.role = roles;

        const result = await AppDataSource.manager.save(User, user);
        return { status: 'updated', data: result };
    }

    @httpPost('/upsert-role', defaultAuthHandler([RoutePermissions.roles]))
    async upsertRole(@requestBody() payload: RoleBody) {
        const role = new Role();
        role.name = payload.name;
        // Validate the perms array
        if (!Array.isArray(payload.permissions) && (payload.permissions as Array<string>).length) {
            throw new ClientError('Permissions must be a non-empty array of strings');
        }
        payload.permissions.forEach(function (item) {
            if (typeof item !== 'string') {
                throw new ClientError('Invalid permission type provided.');
            }
        });
        role.permissions = JSON.stringify(payload.permissions);
        payload.permissions;
        return await AppDataSource.manager.transaction(async () => {
            const existingRole = await AppDataSource.manager.findOne(Role, { where: { name: role.name } });
            if (existingRole) {
                role.id = existingRole.id;
            }
            const result = await AppDataSource.manager.save(role);
            return { status: 'created', data: result };
        });
    }

    @httpPost('/login')
    async loginUser(@requestBody() payload: any) {
        const { username, password } = payload;

        if (!username || !password) {
            throw new ClientError('Both username and password are required.');
        }
        const result = await AppDataSource.manager.find(User, {
            where: { username },
            relations: {
                role: true
            }
        });
        // Check for existence of user
        if (!result.length) {
            throw new ClientError('User does not exist');
        }
        const user = result[0];
        const hashedPassword = user.password;
        let isPasswordCorrect;

        try {
            isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
        } catch (errBcrypt) {
            // This should only happen if the hashing method mismatch
            throw new ClientError('Error: Could not get user password');
        }

        // Wrong password given
        if (!isPasswordCorrect) {
            throw new ClientError('Incorrect Credentials');
        }

        //User authenticated
        delete user.password;

        const token = issueToken(user);
        return { ...user, token };
    }
}
