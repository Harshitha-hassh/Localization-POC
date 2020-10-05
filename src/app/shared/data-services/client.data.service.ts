import { Injectable } from "@angular/core";
//import { GolfScheduleCommunication } from '../../communication/services/golfschedule.service';
import { TransactionDetails, OutOfStock, DonutCount, ItemData, TransactionSaleDetail, CategoryData,ReturnedItems,OpenTickets,VendorInfo } from 'src/app/home/dashboard-widgets-report/dashboard.modal';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailPosCommunication } from '../communication/services/retailpos.service';
import { ClientInfo, ClientSearchModel, ClientGlobalSearchModel } from 'src/app/client/client-popup/create-client/client.modal';


@Injectable()
export class ClientDataService {

    constructor(private _httpPos: RetailPosCommunication
        , private localization: RetailStandaloneLocalization) {
    }    

    public async CreateClientDetails(requestBody:ClientInfo): Promise<any> {
        return this._httpPos.postPromise({
            route: RetailApiRoute.CreateClient,
            body: requestBody
        });
    }

    public async UpdateClientDetails(requestBody: ClientInfo): Promise<any> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.UpdateClient,
            body: requestBody
        });
    }

    public async searchClientByPatron(patronId: string): Promise<ClientInfo> {
        return this._httpPos.getPromise({
            route: RetailApiRoute.GetClientByPatronId,
            uriParams: { patronId : patronId }
        });
    }

    public async getClientbyGuestId(guestId : string) : Promise<ClientInfo>{
        return this._httpPos.getPromise({
            route: RetailApiRoute.GetClientByGuestId,
            uriParams: { guid : guestId }
        });
    }

    public async searchClient(name: string, requestUid: string): Promise<ClientSearchModel[]> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.SearchClientInfo,
            body: name,
            uriParams: { requestUid: requestUid }
        });
    }

    public async searchClientForGlobalSerach(name: string): Promise<ClientGlobalSearchModel> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.GlobalSearchClientInfo,
            body: name 
        })
    }
               
    public async getClients(id : number[]): Promise<any[]> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.GetClientByIds,
            body: id,
            uriParams: { includeRelatedData: false }
        });
    }

    public async getGuestStayDetails(guestId: string): Promise<any[]> {
        return this._httpPos.getPromise({
            route: RetailApiRoute.GetClientStayDetails,
            uriParams: { clientId: guestId }
        });
    }
}