import { IAppService, Hosts } from './common/app-service';
import { Product, Utilities } from './core/utilities';
import { EventActorsDataProvider } from './common/Models/notification.model';
import * as Retailroutes from '../assets/json/hosts/retail-hosts.json';
import { RetailEventActorDataProvider } from './Retail-eventactor.dataprovider';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

export class RetailAppService implements IAppService {

    constructor(private utilities: Utilities, private localization: RetailStandaloneLocalization) {
        
    }

    /**
     * Assign Hosts to AppService
     * @memberof IAppService
     */
    get hosts(): Hosts {
        return <Hosts>{
            TenantManagement: Retailroutes.RetailApiHosts.TenantManagement,
            Report: Retailroutes.RetailApiHosts.Report,
            Common: Retailroutes.RetailApiHosts.common,
        }
    }

    /**
    * Assign ProductID to AppService
    * @memberof IAppService
    */
    get productId(): number {
        return Product.RETAIL;
    }

    get notificationEventDataProvider(): EventActorsDataProvider {
        return { providers: new RetailEventActorDataProvider(this.utilities, this.localization).providers }
    }

}
