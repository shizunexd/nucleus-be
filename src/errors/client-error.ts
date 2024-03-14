import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import StandardError from './standard-error';

export default class ClientError extends StandardError {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number = StatusCodes.BAD_REQUEST) {
        super(message);
        this.statusCode = statusCode;
    }
}
