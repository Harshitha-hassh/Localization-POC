import { HttpCallService } from '../common/http-call.service';
import { Injectable } from '@angular/core';
import { Localization } from 'src/app/core/localization/Localization';
import { ServiceParams, BaseResponse } from '../../models/http.model';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { Utilities } from 'src/app/core/utilities';
@Injectable({ providedIn: 'root' })
/**
 * Communication layer for payment micro service
 * HttpCalls can be overriden here
*/
export class PaymentCommunication extends HttpCallService {

    constructor(private utils: Utilities,httpclient: HttpClient, localization: Localization, PropertyInfo: PropertyInformation) {
        super(RetailApiHost.RetailManagement, httpclient, localization,utils, PropertyInfo);
    }

    public async getPromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        let response$: Promise<BaseResponse<T>> = super.getPromise<BaseResponse<T>>(params);

        //on error =>
        response$.catch(err => this.error(err, handleErr));

        //on success =>
        let response: BaseResponse<T> = await response$;
        return response.result;
    }

    public async putPromise<T>(params: ServiceParams, handleErr: boolean = true) {
        let response$: Promise<T> = super.putPromise<T>(params);

        //on error =>
        response$.catch(err => this.error(err, handleErr));

        //on success =>
        let response: T = await response$;
        return response;
    }

    public async postPromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        let response$: Promise<T> = super.postPromise<T>(params);

        //on error =>
        response$.catch(err => this.error(err, handleErr));

        //on success =>
        let response: T = await response$;
        return response;
    }

    private error(err: HttpErrorResponse, handleErr: boolean) {
        if (handleErr) {
            super.errorHandler(err);
        }
        else {
            throw err;
        }
    }
}
