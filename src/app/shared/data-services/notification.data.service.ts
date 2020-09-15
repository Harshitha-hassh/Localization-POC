import { Injectable } from "@angular/core";
//import { GolfScheduleCommunication } from '../../communication/services/golfschedule.service';
import { TransactionDetails, OutOfStock, DonutCount, ItemData, TransactionSaleDetail, CategoryData,ReturnedItems,OpenTickets,VendorInfo } from 'src/app/home/dashboard-widgets-report/dashboard.modal';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailPosCommunication } from '../communication/services/retailpos.service';
import { ClientInfo, ClientSearchModel, ClientGlobalSearchModel } from 'src/app/client/client-popup/create-client/client.modal';
import { NotificationModel } from '../shared-models';


@Injectable()
export class NotificationDataService {

    constructor(private _httpPos: RetailPosCommunication
        , private localization: RetailStandaloneLocalization) {
    }

    public async SendNotification(transactionId: number, isManual: boolean, emailId: string = '', phoneNumber: string ='',
        canSendSMS: boolean=true, canSendemail: boolean=true): Promise<any> {

        let bodyObj : NotificationModel;
        bodyObj = {
            transactionId : transactionId,
            action : "RetailReceipts",
            emailId : emailId ? emailId : null,
            phoneNumber : phoneNumber ? phoneNumber : null,
            canSendSMS : canSendSMS ? canSendSMS : false,
            canSendemail : canSendemail ? canSendemail : false,
            isManual:  isManual
        }

        return this._httpPos.putPromise({
            route: RetailApiRoute.SendManualNotification,
            body: bodyObj
        });
    }
}