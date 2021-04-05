import { IAppService, Hosts } from './common/app-service';
import { Product, Utilities } from './core/utilities';
import { EventActorsDataProvider, NotificationDataProvider } from './common/Models/notification.model';
import { RetailEventActorDataProvider } from './Retail-eventactor.dataprovider';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { environment } from 'src/environments/environment';

export class RetailAppService implements IAppService {

    constructor(private utilities: Utilities, private localization: RetailStandaloneLocalization) {
        
    }

    /**
     * Assign Hosts to AppService
     * @memberof IAppService
     */
    get hosts(): Hosts {
        return <Hosts>{
            TenantManagement: environment['TenantManagement'],
            Report: environment['Report'],
            Common: environment['common'],
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

    // To do : to be implemented
    notificationDataProvider: NotificationDataProvider;

}
