/* eslint-disable import/order */
import { createApp } from './app';
const DEFAULT_PORT = 3000;

(async () => {
    try {
        const app = await createApp();
        app.listen(app.get('port') || DEFAULT_PORT);
        console.log('Server is up!');
    } catch (e) {
        console.error(e, 'Failed to start server:');
    }
})();
