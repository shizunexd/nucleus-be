import 'reflect-metadata';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Container, AsyncContainerModule } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import logger from 'pino-http';
import cors from 'cors';
import { defaultNotFoundHandler, errorHandler } from './middlewares/default-not-found';

import './controllers/inventory';
import './controllers/healthcheck';
import './controllers/auth';

export async function createApp(): Promise<Application> {
    const container = new Container();
    await container.loadAsync(new AsyncContainerModule(async () => {}));
    const app = express();
    app.use(logger());
    app.use(cors());
    app.set('port', process.env.PORT || 3000);
    app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    const server = new InversifyExpressServer(container, null, null, app);
    server.setErrorConfig((app) => {
        app.use(defaultNotFoundHandler());
        app.use(errorHandler());
    });
    return server.build();
}
