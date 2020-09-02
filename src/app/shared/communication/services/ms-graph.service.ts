import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { Utilities } from 'src/app/core/utilities';
import { MsGraphHttpService } from '../common/ms-graph-http.service';
import { GraphServiceParams } from '../../models/ms-graph-http.model';
import { PropertyInformation } from 'src/app/core/services/property-information.service';

@Injectable(

)
/**
 * Communication layer for Snc management micro service
 * HttpCalls can be overriden here
**/
export class MsGraphApiCommunication extends MsGraphHttpService {

    captions: any;
    constructor(
        propertyInfo: PropertyInformation,
        localization: RetailStandaloneLocalization,
        utilities: Utilities) {
        super(propertyInfo, localization, utilities);
    }

    public async getPromise<T>(params: GraphServiceParams, handleErr: boolean = true): Promise<T> {
        const response$: Promise<T> = super.getPromise<T>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: T = await response$;
        return response;
    }


    public async postPromise<T>(params: GraphServiceParams, handleErr: boolean = true): Promise<T> {
        const response$: Promise<T> = super.postPromise<T>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: T = await response$;
        return response;
    }

    public async putPromise<T>(params: GraphServiceParams, handleErr: boolean = true): Promise<T> {
        const response$: Promise<T> = super.putPromise<T>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: T = await response$;
        return response;
    }

    public async deletePromise<T>(params: GraphServiceParams, handleErr: boolean = true): Promise<T> {
        const response$: Promise<T> = super.deletePromise<T>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: T = await response$;
        return response;
    }

    public async openWebMailWithMessage(params: GraphServiceParams, handleErr: boolean = true): Promise<any> {
        const response$: Promise<any> = super.postPromise<any>(params);

        // on error =>
        response$.catch(err => this.error(err, handleErr));

        // on success =>
        const response: any = await response$;
        return response;
    }



    private error(err: HttpErrorResponse, handleErr: boolean) {
        if (handleErr) {
            super.errorHandler(err);
        } else {
            throw err;
        }
    }


}

