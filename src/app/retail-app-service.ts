import { IAppService, Hosts } from './common/app-service';
import { Product } from './core/utilities';
import { EventActorsDataProvider } from './common/Models/notification.model';
import * as Retailroutes from '../assets/json/hosts/retail-hosts.json';


export class RetailAppService implements IAppService {

    constructor() {
    }

    /**
     * Assign Hosts to AppService
     * @memberof IAppService
     */
    get hosts(): Hosts {
        return <Hosts>{
            TenantManagement: Retailroutes.RetailApiHosts.TenantManagement,
            Report: Retailroutes.RetailApiHosts.Report,
            Common: "",
        }
    }

    /**
    * Assign ProductID to AppService
    * @memberof IAppService
    */
    get productId(): number {
        return Product.SNC;
    }

    get notificationEventDataProvider(): EventActorsDataProvider {
        return undefined;
    }

}
