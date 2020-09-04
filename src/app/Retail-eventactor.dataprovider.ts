import { EventActorsDataProvider, IEventActorDataProvider, EventActorCollection, Users } from './common/Models/notification.model';
import * as Retailroutes from '../assets/json/hosts/retail-hosts.json';
import { Utilities, Product } from './core/utilities';

export class RetailEventActorDataProvider implements EventActorsDataProvider {

    constructor(private utils: Utilities, private caption: any) {
    }
    get providers(): IEventActorDataProvider[] {
        const caption = this.caption.captions.settings.utilities.distributionlist;
        return [
            {
                actor: 'UserRoles',
                actorDescription: caption.UserRoles,
                host: Retailroutes.RetailApiHosts.TenantManagement,
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
                host: Retailroutes.RetailApiHosts.TenantManagement,
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

