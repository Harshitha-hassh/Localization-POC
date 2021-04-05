import { environment } from 'src/environments/environment';
import { EventActorsDataProvider, IEventActorDataProvider, EventActorCollection, Users } from './common/Models/notification.model';
import { Utilities, Product } from './core/utilities';

export class RetailEventActorDataProvider implements EventActorsDataProvider {

    constructor(private utils: Utilities, private caption: any) {
    }
    get providers(): IEventActorDataProvider[] {
        const caption = this.caption.captions.settings.utilities.distributionlist;
        return [
            {
                actor: 'BillingGuest',
                actorDescription: caption.BillingGuest
            },
            {
                actor: 'UserRoles',
                actorDescription: caption.UserRoles,
                host: environment['TenantManagement'],
                route: `UserRole/GetActiveUserRolesByPropertyId/${this.utils.GetPropertyInfo('PropertyId')}/false`,
                uiMapper: (apiValue: any[]) => {
                    return apiValue.filter(o=>o.productId.includes(Product.RETAIL)).map(a => {
                        return <EventActorCollection>{
                            id: a.id,
                            desc: a.description
                        }
                    });
                }
            },
            {
                actor: 'Users',
                actorDescription: caption.Users,
                host: environment['TenantManagement'],
                route: `User/GetAllUserbyTenantId/${this.utils.GetPropertyInfo('TenantId')}?inActive=false`,
                uiMapper: (apiValue: Users[]) => {
                    return apiValue.map(a => {
                        return <EventActorCollection>{
                            id: a.userId,
                            desc: `${a.firstName} ${a.lastName}`
                        }
                    });
                }
            }
        ]
    }



}

