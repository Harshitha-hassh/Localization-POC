import { Injectable } from '@angular/core';
import { Localization } from '../../core/localization/Localization';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { BaseResponse } from 'src/app/common/Models/http.model';
import { Utilities } from 'src/app/core/utilities';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { UserSubPropertyAccess } from 'src/app/common/shared/shared/business/view-settings.modals';

@Injectable()

export class UserOutletAccessDataService {

    constructor(private http: HttpServiceCall, private utils: Utilities, private localization: Localization) { }
    /**
      * @returns {Promise<UserSubPropertyAccess[]>}
      * @memberof UserOutletAccessDataService
      */

    public async GetOutletsAccessByPropertyId(): Promise<UserSubPropertyAccess[]> {

        const result = await this.invokeServiceCalls<UserSubPropertyAccess[]>('GetOutletsAccessByPropertyId', HttpMethod.Get, undefined);
        return result;
    }

    /**
      * @param {number} userId
      * @returns {Promise<UserSubPropertyAccess[]>}
      * @memberof UserOutletAccessDataService
      */
    public async GetOutletsAccessByUser(userId: number): Promise<UserSubPropertyAccess[]> {
        const result = await this.invokeServiceCalls<UserSubPropertyAccess[]>('GetSubPropertyAccessByUser', HttpMethod.Get, undefined, { 'id': userId });
        return result;
    }

    /**
     * @param {UserOutletAccess} userRetailConfiguration
     * @returns {Promise<boolean>}
     * @memberof UserOutletAccessDataService
     */
    public async CreateUserOutletAccess(userOutlets: UserSubPropertyAccess[]): Promise<boolean> {
        const result = await this.invokeServiceCalls<boolean>('CreateUserOutletAccess', HttpMethod.Post, userOutlets);
        return result;
    }

    /**
     * @param {UserOutletAccess} userRetailConfiguration
     * @returns {Promise<boolean>}
     * @memberof UserOutletAccessDataService
     */
    public async UpdateUserOutletAccess(userOutlets: UserSubPropertyAccess[]): Promise<boolean> {

        const result = await this.invokeServiceCalls<boolean>('UpdateUserOutletAccess', HttpMethod.Put, userOutlets);
        return result;
    }

    private async invokeServiceCalls<T>(callDesc: string, callType: HttpMethod, body?: any, uRIParams?: any): Promise<T> {
        const response: BaseResponse<T> = await this.http.CallApiAsync<T>({
            callDesc,
            host: Host.retailManagement,
            method: callType,
            body,
            uriParams: uRIParams
        });

        if (!response.successStatus) {
            this.showError(response.errorCode);
        }
        return response.result;
    }

    private showError(errorCode: number) {
        const errMsg = this.localization.getError(errorCode);
        this.utils.showError(errMsg);
    }

}