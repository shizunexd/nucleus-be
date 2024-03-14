import ClientError from '../errors/client-error';
import ServerError from '../errors/server-error';
import { Request, NextFunction, Response } from 'express';
import Status, { getReasonPhrase } from 'http-status-codes';

export const errorHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    return (err: any, req: any, res: Response, next: NextFunction) => {
        // 4XX errors
        if (err instanceof ClientError) {
            return res.status(err.statusCode).json({
                status_code: err.statusCode,
                message: err.message
            });
        }

        if (err instanceof ServerError) {
            return res.status(err.statusCode).json({
                status_code: err.statusCode,
                message: err.message
            });
        }

        // Default uncaught errors
        console.log(err);
        return res.status(Status.INTERNAL_SERVER_ERROR).send({
            status_code: Status.INTERNAL_SERVER_ERROR,
            error: getReasonPhrase(Status.INTERNAL_SERVER_ERROR),
            message: 'Something unexpected happened.'
        });
    };
};

export const defaultNotFoundHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (req: Request, res: Response, next: NextFunction) => {
        return res.status(Status.NOT_FOUND).send({
            status_code: Status.NOT_FOUND,
            error: getReasonPhrase(Status.NOT_FOUND),
            message: 'The requested resource does not exist.'
        });
    };
};
