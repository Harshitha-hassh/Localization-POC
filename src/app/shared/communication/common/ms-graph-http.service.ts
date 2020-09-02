import { BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Client, GraphRequest, Options } from '@microsoft/microsoft-graph-client';
import { MsalService } from '@azure/msal-angular';
import { Utilities } from 'src/app/core/utilities';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { GraphServiceParams, GraphUser } from '../../models/ms-graph-http.model';
import { UserAgentApplication, CacheLocation } from 'msal';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { MsalConfiguration } from './msal-config';
import { AlertType } from 'src/app/common/Models/common.models';

export class MsGraphHttpService {
    private app: UserAgentApplication;
    private graphClient: Client;
    private loggedInUser = new BehaviorSubject('');
    currentUser = this.loggedInUser.asObservable();
    captions: any;
    clientAuthenticated: boolean;
    signedInAs: string;
    utilities: Utilities;
    config: any;
    pendingGraphRequest: GraphRequest[];
    constructor(
        private propertyInfo: PropertyInformation,
        localization: RetailStandaloneLocalization,
        utilities: Utilities) {
        this.captions = localization.captions;
        this.utilities = utilities;
        if(!this.app)
            this.Init();
    }

    Init() {
        try {
        this.config = (this.propertyInfo.GetPropertyConfiguration() || {});
            if (this.config.hasOwnProperty('clientId')) {
                this.app = new UserAgentApplication({
                    auth: {
                        clientId: this.config.clientId,
                        redirectUri: (MsalConfiguration.redirectUri || window.location.origin),
                    },
                    cache: {
                        cacheLocation: (MsalConfiguration.cacheLocation || 'sessionStorage') as CacheLocation
                    },
                    framework: {
                        unprotectedResources: MsalConfiguration.unprotectedResources,
                    }
                });

                this.app.handleRedirectCallback((authError, response) => {
                    if (authError) {
                        console.error('Redirect Error: ', authError.errorMessage);
                        return;
                    }
                    console.log('Redirect Success: ', response.accessToken);
                });

                this.graphClient = Client.init(this.getClientOptions());
            }
            else {
                console.log("ClientId not registered for this property");
            }
        }
        catch (err) {
            console.dir(err);
        }
    }

    private getClientOptions(): Options {
        return {
            authProvider: async (done) => {
                const token = await this.getAccessToken()
                    .catch((reason) => {
                        done(reason, null);
                    });
                if (token) {
                    done(null, token);
                } else {
                    done('Could not get an access token', null);
                }
            }
        }
    }

    protected getPromise<T>(params: GraphServiceParams): Promise<T> {
        const vClient = this.buildGraphClient(params);
        return vClient.get();
    }

    protected postPromise<T>(params: GraphServiceParams): Promise<T> {
        const vClient = this.buildGraphClient(params);
        return vClient.post(params.body);
    }

    protected putPromise<T>(params: GraphServiceParams): Promise<T> {
        const vClient = this.buildGraphClient(params);
        return vClient.update(params.body);
    }

    protected deletePromise<T>(params: GraphServiceParams): Promise<T> {
        const vClient = this.buildGraphClient(params);
        return vClient.delete();
    }

    protected errorHandler(err: HttpErrorResponse): void {
        // alert('graph-api-error');
        console.log(err);
    }

    private buildGraphClient(params: GraphServiceParams): GraphRequest {
        // if (params.forceLogin && !this.clientAuthenticated) {
        //     this.forceLoginIfNotAuthenticated();
        // }
        let url: string = this.formURL(params);
        let gr: GraphRequest = this.graphClient.api(url);
        // let gr: GraphRequest = this.graphClient.api(params.route);
        if (params.isBeta) {
            gr = gr.version('beta');
        }
        return gr;
    }

    // forceLoginIfNotAuthenticated() {
    //     this.signInToGraph();
    // }

    async signInToGraph(): Promise<boolean> {
        this.initializeApp();
        if(this.app){
            const result = await this.app.loginPopup(this.utilities.getMsalAuthParams())
            .catch((reason) => {
                console.log(JSON.stringify(reason, null, 2));
            });
            if (result) {
                this.clientAuthenticated = true;
                this.loggedInUser.next(this.captions.mail_signedInAs + result.account.userName);
            } else {
                this.loggedInUser.next(this.captions.mail_signInToMicrosoft);
            }
            return this.clientAuthenticated;
        }
    }

    async isAuthenticated() {
        if (!this.clientAuthenticated) {
            await this.getAccessToken();
        }
        return this.clientAuthenticated;
    }

    async getAccessToken(): Promise<string> {
        this.initializeApp();
        if(this.app){
            const result = await this.app.acquireTokenSilent(this.utilities.getMsalAuthParams())
            .catch((reason) => {
                console.log(JSON.stringify(reason, null, 2));
            });
            if (result) {
                this.clientAuthenticated = true;
                this.loggedInUser.next(this.captions.mail_signedInAs + result.account.userName);
                return result.accessToken;
            } else {
                this.loggedInUser.next(this.captions.mail_signInToMicrosoft);
            }
        }
        return null;
    }

    async getUser(): Promise<GraphUser> {
        if (!this.clientAuthenticated) { return null; }
        const graphUser = await this.graphClient.api('/me').get();
        return graphUser;
    }

    async isAuthenticatedToAction(action?: string): Promise<boolean> { // TODO: re-define the action string
        const isAuthenticated = await this.isAuthenticated();
        if (isAuthenticated === undefined || !isAuthenticated) {
            this.utilities.showAlert(this.captions.mail_pleaseLoginToMicrosoft + action, AlertType.Error);
        }
        return isAuthenticated;
    }

    async signOutOfGraph(): Promise<boolean> {
        this.app.logout();
        this.clientAuthenticated = false;
        this.loggedInUser.next(this.captions.mail_signInToMicrosoft);
        return this.clientAuthenticated;
    }

    private formURL(params: GraphServiceParams): string {
        this.validate(params);
        let url: string = '';
        if (params.uriParams != undefined && params.uriParams != null && typeof params.uriParams == 'object') {
            let route: string = params.route;
            let keys: string[] = Object.keys(params.uriParams);
            for (let i = 0; i < keys.length; i++) {
                var regEx = new RegExp('{' + keys[i] + '}', 'ig');
                route = route.replace(regEx, params.uriParams[keys[i]]);
            }
            url += route;
        } else {
            url += params.route;
        }

        url = this.formatQueryString(url, params);
        return url;
    }

    private formatQueryString(url: string, params: GraphServiceParams): string {
        //this.validateQueryString(url);
        let queryParams: string[] = this.matchQueryStringRegex(url);
        for (var queryParam of queryParams) {
            var paramName = queryParam.split(':')[0];
            paramName = paramName ? paramName : '';
            paramName = paramName.replace('{', '');
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

    private validate(params: GraphServiceParams): void {
        if (!params) {
            throw new Error('Route not defined');
        }
        if (params.route.includes('{') && !params.uriParams) {
            let message: string = `Route Param '${params.route.match('\{(.*?)\}')[1]}' is not defined in route '${params.route}'`;
            alert(message);
            throw new Error(message);
        }
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

    initializeApp(){
        if(!this.app)
            this.Init();
    }

}
