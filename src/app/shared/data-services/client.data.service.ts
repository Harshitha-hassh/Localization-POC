import { Injectable } from "@angular/core";
//import { GolfScheduleCommunication } from '../../communication/services/golfschedule.service';
import { TransactionDetails, OutOfStock, DonutCount, ItemData, TransactionSaleDetail, CategoryData,ReturnedItems,OpenTickets,VendorInfo } from 'src/app/home/dashboard-widgets-report/dashboard.modal';
import { Localization } from 'src/app/core/localization/Localization';
import { RetailPosCommunication } from '../communication/services/retailpos.service';
import { ClientInfo } from 'src/app/client/client-popup/create-client/client.modal';
//import { GolfGatewayCommunication } from '../../communication/services/golfGateway';


@Injectable()
export class ClientDataService {

    constructor(private _httpPos: RetailPosCommunication
        , private localization: Localization) {
    }    

    public async CreateClientDetails(requestBody:ClientInfo): Promise<string> {
        return this._httpPos.postPromise({
            route: RetailApiRoute.CreateClient,
            body: requestBody
        });
    }

    public async UpdateClientDetails(requestBody: ClientInfo): Promise<string> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.UpdateClient,
            body: requestBody
        });
    }
}