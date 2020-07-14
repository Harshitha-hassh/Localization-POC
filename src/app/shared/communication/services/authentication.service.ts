import { HttpCallService } from '../common/http-call.service';
import { Host, ServiceParams, BaseResponse } from '../../models/http.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Localization } from 'src/app/core/localization/Localization';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { Utilities } from 'src/app/core/utilities';

@Injectable()
export class AuthenticationCommunication extends HttpCallService {

    constructor(httpclient: HttpClient, localization: Localization, utilities: Utilities, PropertyInfo: PropertyInformation) {
        super(RetailApiHost.TenantManagement, httpclient, localization, utilities, PropertyInfo);
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
        let response$: Promise<BaseResponse<T>> = super.putPromise<BaseResponse<T>>(params);

        //on error =>
        response$.catch(err => this.error(err, handleErr));

        //on success =>
        let response: BaseResponse<T> = await response$;
        return response.result;
    }

    public async postPromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        let response$: Promise<BaseResponse<T>> = super.postPromise<BaseResponse<T>>(params);

        //on error =>
        response$.catch(err => this.error(err, handleErr));

        //on success =>
        let response: BaseResponse<T> = await response$;
        return response.result;
    }

    public async deletePromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        let response$: Promise<BaseResponse<T>> = super.deletePromise<BaseResponse<T>>(params);

        //on error =>
        response$.catch(err => this.error(err, handleErr));

        //on success =>
        let response: BaseResponse<T> = await response$;
        return response.result;
    }


    public async patchPromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        let response$: Promise<BaseResponse<T>> = super.patchPromise<BaseResponse<T>>(params);

        //on error =>
        response$.catch(err => this.error(err, handleErr));

        //on success =>
        let response: BaseResponse<T> = await response$;
        return response.result;
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
