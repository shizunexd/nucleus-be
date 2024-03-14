import { controller, httpGet, BaseHttpController } from 'inversify-express-utils';

@controller('/healthcheck')
export class HealthcheckController extends BaseHttpController {
    @httpGet('/liveness')
    async liveness() {
        return { status: 'OK' };
    }

    @httpGet('/readiness')
    async readiness() {
        return { status: 'OK' };
    }
}
