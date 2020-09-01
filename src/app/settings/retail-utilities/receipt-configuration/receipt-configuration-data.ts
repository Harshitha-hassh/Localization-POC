import { Localization } from '../../../core/localization/Localization';
import { Outlet, ReceiptModel} from '../../../retail/retail.modals';
import { Injectable } from '@angular/core';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
@Injectable()
export class ReceiptConfigurationDataService {
    constructor(private http: HttpServiceCall, private utils: RetailUtilities, private localization: Localization) { }

    public async getOutletInfo(): Promise<ReceiptModel[]> {
        const receipts: Promise<ReceiptModel[]> = this.invokeServiceCall<ReceiptModel[]>(Host.retailManagement, 'getReceiptInfo', HttpMethod.Get);
        return receipts;
    }

    public async createReceipt(objData): Promise<ReceiptModel[]>
    {
        const receipts: Promise<ReceiptModel[]> = this.invokeServiceCall<ReceiptModel[]>(Host.retailManagement, 'createReceipt', HttpMethod.Post, objData);
        return receipts;
    }

    private async invokeServiceCall<T>(hostName: Host, callDesc: string, methodType: HttpMethod, body?: any, uriParams?: any, extraParams?: any): Promise<T> {
        const response: BaseResponse<T> = await this.http.CallApiAsync<T>({
            host: hostName,
            callDesc,
            body,
            uriParams,
            method: methodType
        });
        if (!response.successStatus) {
            this.showError(response.errorCode);
        }
        return response.result;

    }
    private showError(errorCode: number) {
        const errMsg = this.localization.getError(errorCode);
        this.utils.ShowError('Error', errMsg);
    }
}