import { Injectable } from "@angular/core";
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailPosCommunication } from '../communication/services/retailpos.service';
import { NotificationModel } from '../shared-models';
import { ReportAPIOptions } from 'src/app/retail/shop/shop.modals';
import { ReportAPIModel } from "src/app/retail/retail-reports/business/report.modals";


@Injectable()
export class NotificationDataService {

    constructor(private _httpPos: RetailPosCommunication
        , private localization: RetailStandaloneLocalization) {
    }

    public async SendNotification(transactionId: number, isManual: boolean, emailId: string = '', phoneNumber: string ='',
        canSendSMS: boolean=true, canSendemail: boolean=true, reportAPIOptions : ReportAPIModel = null): Promise<any> {

        let bodyObj : NotificationModel;
        bodyObj = {
            transactionId : transactionId,
            action : "RetailReceipts",
            emailId : emailId ? emailId : null,
            phoneNumber : phoneNumber ? phoneNumber : null,
            canSendSMS : canSendSMS ? canSendSMS : false,
            canSendemail : canSendemail ? canSendemail : false,
            isManual:  isManual,
            reportQuery : reportAPIOptions
        }

        return this._httpPos.putPromise({
            route: RetailApiRoute.SendManualNotification,
            body: bodyObj
        });
    }
}