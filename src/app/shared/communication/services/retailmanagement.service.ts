import { HttpCallService } from '../common/http-call.service';
import { Host, ServiceParams, BaseResponse } from '../../models/http.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { Utilities } from 'src/app/core/utilities';
import { Observable, throwError, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable(
    
)
/**
 * Communication layer for Snc management micro service
 * HttpCalls can be overriden here
**/
export class RetailManagementCommunication extends HttpCallService {

    constructor(httpclient: HttpClient, localization: RetailStandaloneLocalization, utilities: Utilities, PropertyInfo: PropertyInformation) {
        super(RetailApiHost.RetailManagement, httpclient, localization, utilities, PropertyInfo);
    }

    public getObservable<T>(params: ServiceParams, handleErr: boolean = true): Observable<T> {
        return super.get<BaseResponse<T>>(params).pipe(
            map(response => response.result),
            catchError(err => {
                console.log(err);
                return throwError(err);
            })
        );
    }    

    public async getPromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        const response$: Promise<BaseResponse<T>> = super.getPromise<BaseResponse<T>>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: BaseResponse<T> = await response$;
        return response.result;
    }

    public async getPromiseCancellable<T>(params: ServiceParams, handleErr: boolean = true, notifier: Subject<void>): Promise<T> {
        const response$: Promise<BaseResponse<T>> = super.getCancellablePromise<BaseResponse<T>>(params, notifier);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: BaseResponse<T> = await response$;
        return response.result;
    }

    public async putPromise<T>(params: ServiceParams, handleErr: boolean = true) {
        const response$: Promise<BaseResponse<T>> = super.putPromise<BaseResponse<T>>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: BaseResponse<T> = await response$;
        return response.result;
    }

    public async postPromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        const response$: Promise<BaseResponse<T>> = super.postPromise<BaseResponse<T>>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: BaseResponse<T> = await response$;
        return response.result;
    }

    public async deletePromise<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
        const response$: Promise<BaseResponse<T>> = super.deletePromise<BaseResponse<T>>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: BaseResponse<T> = await response$;
        return response ? response.result : undefined;
    }

    private error(err: HttpErrorResponse, handleErr: boolean) {
        if (handleErr) {
            super.errorHandler(err);
        } else {
            throw err;
        }
    }


}

