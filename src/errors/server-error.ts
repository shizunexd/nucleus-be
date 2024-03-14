import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import StandardError from './standard-error';

export default class ServerError extends StandardError {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message);
    }
}
