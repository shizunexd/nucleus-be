import { Application } from 'express';
import { Server } from 'http';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/data-source';

export default class TestUtil {
    app: Application;

    listener: Server;

    isMigrated = false;

    port: number;

    async startServer(): Promise<number> {
        const env = process.env.NODE_ENV;
        if (env !== 'test') {
            return;
        }
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
                .then(() => {
                    // console.log('Data Source has been initialized');
                })
                .catch(() => console.error('Error during data source init.'));
        }

        const retryLimit = 5;
        let retry = 0;
        let isConnected = false;
        while (retry < retryLimit && !isConnected) {
            try {
                // Choosing random port between 3000 and 4999
                const port = Math.floor(Math.random() * (4999 - 3000 + 1) + 3000);
                this.setPort(port);
                if (!this.app) {
                    this.app = await createApp();
                }
                this.listener = this.app.listen(port.toString());
                isConnected = true;
            } finally {
                retry++;
            }
        }
    }

    async stopServer() {
        const env = process.env.NODE_ENV;
        if (env !== 'test') {
            return;
        }
        if (this.listener) {
            this.listener.close();
        }
    }

    setPort(port: number) {
        this.port = port;
    }
}
