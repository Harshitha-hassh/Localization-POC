
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ServiceParams } from '../../models/http.model';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { takeUntil } from 'rxjs/operators';
import { Utilities } from 'src/app/core/utilities';


export class HttpCallService {

    constructor(host
        , private http: HttpClient
        , public localization: RetailStandaloneLocalization
        , private utilities: Utilities,
        private PropertyInfo: PropertyInformation) {
        this.baseURL = host;
    }
    private baseURL: string = '';

    protected get<T>(params: ServiceParams): Observable<T> {
        let url: string = this.formURL(params);
        return this.http.get<T>(url, { headers: this.setHeaders() });
    }

    protected put<T>(params: ServiceParams): Observable<T> {
        let url: string = this.formURL(params);
        params.body = this.requestBodyStringify(params.body);
        return this.http.put<T>(url, params.body, { headers: this.setHeaders() })
    }

    protected reportPut(params: ServiceParams, responseType: string): Observable<any> {
        let url: string = this.formURL(params);
        if (responseType.toLowerCase() == 'text') {
            return this.http.put(params.route, params.body, { headers: this.setHeaders(), responseType: 'text' });
        } else {
            return this.http.put(params.route, params.body, { headers: this.setHeaders(), responseType: 'blob' });
        }
    }

    protected post<T>(params: ServiceParams): Observable<T> {
        let url: string = this.formURL(params);
        return this.http.post<T>(url, params.body, { headers: this.setHeaders() });
    }

    protected delete<T>(params: ServiceParams): Observable<T> {
        let url: string = this.formURL(params);
        const httpOptions =
        {
            headers: this.setHeaders(),
            body: params.body
        };
        return this.http.delete<T>(url, httpOptions);
    }

    protected patch<T>(params: ServiceParams): Observable<T> {
        let url: string = this.formURL(params);
        return this.http.patch<T>(url, params.body, { headers: this.setHeaders() });
    }

    protected getPromise<T>(params: ServiceParams): Promise<T> {
        return this.get<T>(params).toPromise();
    }

    public getCancellablePromise<T>(params: ServiceParams, notifier: Subject<void>): Promise<T> {
        return this.getCancellable<T>(params, notifier).toPromise();
    }


    private getCancellable<T>(params: ServiceParams, notifier: Subject<void>): Observable<T> {
        let url: string = this.formURL(params);
        return this.http.get<T>(url, { headers: this.setHeaders() })
            .pipe(takeUntil(notifier))
    }

    protected putPromise<T>(params: ServiceParams): Promise<T> {
        return this.put<T>(params).toPromise();
    }

    protected postPromise<T>(params: ServiceParams): Promise<T> {
        return this.post<T>(params).toPromise();
    }

    protected patchPromise<T>(params: ServiceParams): Promise<T> {
        return this.patch<T>(params).toPromise();
    }

    protected deletePromise<T>(params: ServiceParams): Promise<T> {
        return this.delete<T>(params).toPromise();
    }
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    private formURL(params: ServiceParams): string {
        this.validate(params);
        let url: string = `${this.baseURL}/`;
        if (params.uriParams != undefined && params.uriParams != null && typeof params.uriParams == 'object') {
            let route: string = params.route;
            let keys: string[] = Object.keys(params.uriParams);
            for (let i = 0; i < keys.length; i++) {
                const escapedKey = this.escapeRegExp(keys[i]);
                var regEx = new RegExp('{' + escapedKey + '}', 'ig');
                route = route.replace(regEx, params.uriParams[keys[i]]);
            }
            url += route;
        } else {
            url += params.route;
        }

        url = this.formatQueryString(url, params);
        return url;
    }


    /**
    * Query String Implementation
    *
    * Input
    *
    * url = http://localhost/route?{id:QueryString}&{name:QueryString}
    * UriParams = {
    * id: [1,2,3]
    * name: 'Bob'
    * }
    *
    * output
    *
    * url = http://localhost/route?id=1&id=2&id=3&name=bob
    *
    */
    private formatQueryString(url: string, params: ServiceParams): string {
        //this.validateQueryString(url);
        let queryParams: string[] = this.matchQueryStringRegex(url);
        for (var queryParam of queryParams) {
            var paramName = queryParam.split(':')[0];
            paramName = paramName ? paramName : '';
            // paramName = paramName.replace('{', '');
            paramName = paramName.replace(/\{/g, '');
            var qParamValue = params.uriParams[paramName];
            var qParamString = '';
            if (typeof qParamValue == 'object' && qParamValue && qParamValue.length > 0) {
                for (var value of qParamValue) {
                    qParamString += `${paramName}=${value}&`
                }
                // To remove last &
                qParamString = qParamString.substr(0, qParamString.length - 1);
            }
            else if (typeof qParamValue == 'object' && qParamValue && qParamValue.length == undefined) {
                let keys: string[] = Object.keys(qParamValue);
                for (let i = 0; i < keys.length; i++) {
                    let route = `${keys[i]}=${qParamValue[keys[i]]}&`;
                    qParamString += route;
                }

                // To remove last &
                if (qParamString.lastIndexOf('&') == qParamString.length - 1)
                    qParamString = qParamString.substr(0, qParamString.length - 1);
            }
            else {
                qParamString = `${paramName}=${qParamValue}`;
            }
            url = url.replace(queryParam, qParamString);
        }
        return url;
    }

    private matchQueryStringRegex(url: string): string[] {
        var regex = /{[A-Z]+:QueryString}/gi;
        var expMatch: RegExpExecArray;
        var result: string[] = [];
        while ((expMatch = regex.exec(url)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (expMatch.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            expMatch.forEach((match, groupIndex) => {
                result.push(match);
            });
        }
        return result;
    }

    private setHeaders(): HttpHeaders {
        const token = sessionStorage.getItem("_jwt");
        const userSessionId = sessionStorage.getItem("userSession");
        let headers = new HttpHeaders()
        .set('Accept-Language', navigator.language)
        .set('Content-Type', 'application/json')
        .set("Authorization", token ? 'Bearer ' + token : "")
        .set("SessionId", userSessionId ? userSessionId : "");
        return headers;
    }

    private getUserToken() {
        var result = sessionStorage.getItem('_userToken');
        return this.localization.validateString(result) ? result : '';
    }
    private getPropertyInfo(name: string) {
        var result = this.utilities.GetPropertyInfo(name);
        return result ? result : '';
    }
    private getUserInfo(name: string) {
        var result = this.utilities.GetUserInfo(name);
        return result ? result : '';
    }
    protected errorHandler(err: HttpErrorResponse): void {
        if (err.error && err.error.errorCode) {
            this.showBusinessError(err.error.errorCode);
        } else {
            this.utilities.showError(err.message);
        }
    }

    private showBusinessError(errorCode: string) {
        let code: number = parseInt(errorCode);
        let message: string = this.localization.getError(code);
        this.utilities.showError(message);
    }



    private validate(params: ServiceParams): void {
        if (!params) {
            throw new Error('Route not defined');
        }
        if (params.route.includes('{') && !params.uriParams) {
            let message: string = `Route Param '${params.route.match('\{(.*?)\}')[1]}' is not defined in route '${params.route}'`;
            alert(message);
            throw new Error(message);
        }
    }

    private validateQueryString(url: string) {
        url = url ? url : '';
        if (url.includes('?') && !url.includes(':QueryString')) {
            let message: string = `Url contains query string seperator and does not contain query params {param:QueryString}`;
            alert(message);
            throw new Error(message);
        }
    }

    private requestBodyStringify(body: any) {
        if (body != null && typeof (body) == "string") {
            body = JSON.stringify(body);
        }
        return body;
    }

}
