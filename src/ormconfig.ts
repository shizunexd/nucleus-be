import entities from './entities';
import migrations from './migrations';

const dbConfig = {
    logging: false,
    entities,
    migrations,
    type: 'sqlite' as any,
    database: 'database.sqlite',
    busyErrorRetry: 1000
};
export default dbConfig;
