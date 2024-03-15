import 'reflect-metadata';
import request from 'supertest';
import { describe, expect, it, afterAll, beforeAll } from '@jest/globals';
import TestUtil from './utils/test-util';

const util = new TestUtil();

beforeAll(async () => {
    await util.startServer();
});

afterAll(async () => {
    await util.stopServer();
});
describe('Test auth middleware', () => {
    it('Should return Unauthorized if user is not logged in', async () => {
        const response = await request(util.app).get('/api/inventory');
        expect(response.status).toBe(401);
    });
});
