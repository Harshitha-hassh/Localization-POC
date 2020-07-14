import { RetailRoutes } from './../../core/extensions/retail-route';


export interface ServiceParams {
    route: RetailRoutes | string;
    uriParams?: any;
    header?: any;
    body?: any;
    showError?: boolean;
}

export class ServiceParams implements ServiceParams {
    route: RetailRoutes | string;
    uriParams?: any;
    header?: any;
    body?: any;
    showError?: boolean;
    baseResponse?: boolean;
}

export interface BaseError {
    errorCode: number;
    errorDescription: string;
}

export interface BaseResponse<T> extends BaseError {
    result: T;
    successStatus: boolean;
    propertyId: number;
    outletId: number;
}

export interface KeyValuePair {
    key: string;
    value: any[];
}


export enum HttpMethod {
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
    Patch = 'PATCH',
    Delete = 'DELETE'
}

export const enum Host {
    image = 'image',
    management = 'management',
    schedule = 'schedule',
    retailManagement = 'retailManagement',
    retailPOS = 'retailPOS',
    authentication = 'authentication',
    reporting = 'report',
    commission = 'commission',
    payment = 'payment'
}


