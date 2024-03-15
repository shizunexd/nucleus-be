import 'reflect-metadata';
import request from 'supertest';
import { describe, expect, it, afterAll, beforeAll, jest } from '@jest/globals';
import TestUtil from './utils/test-util';
import { Request, Response, NextFunction } from 'express';
import { beforeEach } from 'node:test';

const util = new TestUtil();

jest.mock('../src/middlewares/default-auth', () => ({
    defaultAuthHandler: (reqPerms: Array<string>) => (_: Request, __: Response, next: NextFunction) => next(),
    RoutePermissions: {
        view: 'view',
        create: 'create',
        update: 'update',
        delete: 'delete',
        user: 'user',
        roles: 'roles'
    }
}));

beforeAll(async () => {
    await util.startServer();
});

afterAll(async () => {
    await util.stopServer();
});

describe('Test inventory endpoint', () => {
    it('Should return 200 for /inventory', async () => {
        // Reset the test data to initial state
        await request(util.app).post('/api/reload-database');
        const response = await request(util.app).get('/api/inventory');
        expect(response.status).toBe(200);
    });
    it('Should return 200 for /inventory/:id', async () => {
        // Reset the test data to initial state
        await request(util.app).post('/api/reload-database');
        const response = await request(util.app).get('/api/inventory/1');
        expect(response.status).toBe(200);
    });

    it('Should return 200 for /delete-inventory/:id', async () => {
        // Reset the test data to initial state
        await request(util.app).post('/api/reload-database');
        const response = await request(util.app).delete('/api/delete-inventory/1');
        expect(response.status).toBe(200);
        const deleted = await request(util.app).get('/api/inventory/1');
        expect(deleted.status).toBe(404);
    });

    it('Should return 200 for /update-inventory/:id', async () => {
        // Reset the test data to initial state
        await request(util.app).post('/api/reload-database');
        const response = await request(util.app).patch('/api/update-inventory/2').send({
            name: 'updated test'
        });
        expect(response.status).toBe(200);
        const updated = await request(util.app).get('/api/inventory/2');
        expect(updated.status).toBe(200);
        expect(updated.body.data.name).toBe('updated test');
    });
});
