import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { Utilities } from '../core/utilities';
import { TenantManagementCommunication } from '../shared/communication/services/tenantmanagement.service';
import { RetailRoutes } from '../core/extensions/retail-route';
import moment from 'moment';
import { HttpMethod, HttpServiceCall } from '../retail/shared/service/http-call.service';
import { AlertType } from '../common/enums/shared-enums';
import { RetailLocalization } from '../retail/common/localization/retail-localization';
import { JWT_TOKEN, REMEMBER_INFO, USERS_SESSSIONS_INFO } from '../app-constants';
import { Host } from '../retail/shared/globalsContant';
import { NotificationFailureType } from '../shared/components/menu/menu.model';
import { RetailPropertyInformation } from '../retail/common/services/retail-property-information.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { ADB2CAuthConfiguration } from 'src/app/common/shared/auth.config';
import { SignalrService } from 'src/app/common/communication/signalR/signalr.service';

@Injectable({
    providedIn: 'root'
})
export class ManageSessionService implements OnDestroy {

    public resetOnTrigger = false;
    public timeoutExpired: Subject<number> = new Subject<number>();

    private _count = 0;
    userSessionId = 'userSession';
    private _logOffAfter: number;
    private _timeoutSeconds: number;
    private timerSubscription: Subscription;
    private timer: Observable<number>;
    public timerSubscriptionForNotification: Subscription;
    public timerForNotification: Observable<number>;
    public transactionCount: BehaviorSubject<{ id: number, count: number }[]> = new BehaviorSubject([]);

    token = {
        refresh_token: 'refreshtokencode',
        exp: '',
        access_token: {
            username: 'user',
            roles: ['Admin', 'RegisteredUser', 'Super User']
        }
    };

    scope = 'Spa';
    state: string = Date.now() + '' + this.utils.getRandomDecimal();
    tokenKey = 'a5smm_utoken';
    propertyKey = 'propertyInfo';
    url = '';
    tenantId: any = 1;
    locations: any[];
    propertyValues: any[];

    rememberDetail: any[] = [{ name: '' }];
    logOutWaitingtime: number = 120000; //milliseconds
    tokenTimerSubscription: Subscription;
    private tokenTimer: Observable<number>;
    private triggerTimeout: any;

    constructor(private router: Router
              , public dialogRef: MatDialog
              , public loginService: TenantManagementCommunication
              , private utils: Utilities
              , public http: HttpServiceCall,
                private localize: RetailLocalization,
                private propertyInformation: RetailPropertyInformation
              , private oauthService: OAuthService
              , private adb2cAuthConfiguration: ADB2CAuthConfiguration,
                private signalR: SignalrService) {

        this.timeoutExpired.subscribe(n => {
        });
        if (this.tokenTimerSubscription) {
            this.tokenTimerSubscription.unsubscribe();
        }
        if (this.timerSubscriptionForNotification) {
            this.timerSubscriptionForNotification.unsubscribe();
        }
    }

    goToLogin() {
        this.router.navigate(['login']);
    }

    ngOnDestroy() {
        this.timeoutExpired.unsubscribe();
        if (this.tokenTimerSubscription) {
            this.tokenTimerSubscription.unsubscribe();
        }
        this.stopTimerForNotification();
    }

    async logout() {
        this.closeSignalRConnection();
        clearTimeout(this.triggerTimeout);
        this.triggerTimeout = null;
        this.stopTimerForNotification();
        this.doLogoutActivities();
        await this.updateSession();
        this.removeToken();
        this.dialogRef.closeAll();
        this.http.removeHelpUserSession();
        this.clearLocalStore();
        this.changeTitle();
        this.goToLogin();
        if(this.adb2cAuthConfiguration.ADB2CAuthFeatureEnabled)
        {
            console.log('adb2c logout');
            this.oauthService.logOut(); //ADB2C logout 
        }
    }
    async closeSignalRConnection(){
        this.signalR.stopConnection();
      }  
    

    public GetPropertyInfo(name: string) {
        return this.utils.GetPropertyInfo(name);
    }

    getToken() {
        return JSON.parse(sessionStorage.getItem(this.tokenKey));
    }

    setToken(token = this.token) {
        sessionStorage.setItem(this.tokenKey, JSON.stringify(token));
    }

    getAccessToken() {
        return JSON.parse(sessionStorage.getItem(this.tokenKey)).access_token;
    }

    isAuthenticated() {
        const token = sessionStorage.getItem(this.tokenKey);

        if (token) {
            return true;
        } else {
            return false;
        }
    }

    refreshToken() {

    }

    removeToken() {
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(JWT_TOKEN);
    }

    clearLocalStore() {
        const rememberDetails = sessionStorage.getItem(REMEMBER_INFO);
        sessionStorage.clear();
        sessionStorage.setItem(REMEMBER_INFO, rememberDetails);
    }

    StoreUser(user: string) {
        let rememberList = this.GetRememberedUsers();
        if (rememberList.find(x => x.name == user)) { return; }
        rememberList = [{ name: user }];
        sessionStorage.setItem(REMEMBER_INFO, JSON.stringify(rememberList));
    }

    RemoveUser(user) {
        const storedUsers = this.GetRememberedUsers();
        const updatedStore = _.remove(storedUsers, (u) => {
            return !(u.name == user);
        });
        sessionStorage.setItem(REMEMBER_INFO, JSON.stringify(updatedStore));
    }

    GetRememberedUsers(): any[] {
        let rememberList = JSON.parse(sessionStorage.getItem(REMEMBER_INFO));
        rememberList = (rememberList != null) ? rememberList : [];
        return rememberList;
    }

    CheckRememberDetails(): boolean {
        let rememberList = JSON.parse(sessionStorage.getItem(REMEMBER_INFO));
        rememberList = (rememberList != null) ? rememberList : [];
        return rememberList.length > 0;
    }

    async doLogoutActivities() {
        const userName = this.utils.GetUserInfo('userName');
        if (userName != null && userName != undefined && userName != 'null' && userName != 'undefined') {
            await this.serverLogOut(userName);
        }
    }

    serverLogOut(userName: string) {
        const tenantId = this.utils.GetPropertyInfo('TenantId');
        const propertyId: number = Number(this.utils.GetPropertyInfo('PropertyId'));

        const uriParams = {
            Username: userName
            , TenantId: tenantId
            , PropertyId: propertyId
        };

        const serviceParams = {
            route: RetailApiRoute.LogOut,
            uriParams,
            header: '',
            body: '',
            showError: false,
            baseResponse: true
        };

        return this.loginService.postPromise(serviceParams);
    }

    public changeTitle() {
        const title = document.getElementsByTagName('title')[0];
        title.innerText = this.getPropertyName() ? this.getPropertyName() + ' - ' + this.localize.captions.app_title :
            this.localize.captions.app_title;
    }

    createSession(): Promise<number> {

        const userId: number = Number(this.utils.GetUserInfo('userId'));
        const propertyId: number = Number(this.utils.GetPropertyInfo('PropertyId'));
        const productId: number = Number(this.utils.GetPropertyInfo('ProductId'));
        const timeZone = this.utils.GetPropertyInfo('TimeZone');
        const userToken = sessionStorage.getItem(JWT_TOKEN);

        const sessionData = {
            userId,
            startTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
            propertyId,
            productId,
            timeZone,
            userToken
        };

        const serviceParams = {
            route: RetailRoutes.CreateSession,
            uriParams: '',
            header: '',
            body: sessionData,
            showError: true,
            baseResponse: true
        };

        return this.loginService.postPromise<number>(serviceParams);
    }

    async updateSession() {

        const sessionData = {
            isActive: false,
            endTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
        };

        const sessionId: string = sessionStorage.getItem(this.userSessionId);
        if (!sessionId) {
            return;
        }
        const serviceParams = {
            route: RetailRoutes.UpdateSession,
            uriParams: { sessionId },
            header: '',
            body: sessionData,
            showError: true,
            baseResponse: true
        };

        await this.loginService.putPromise(serviceParams);
    }

    public UpdateUserSessionsInfo(loginDetails) {
        let userSessionDetails = this.GetUserSessionsInfo();
        userSessionDetails = this.mapLoginDetailsToLocalModel(loginDetails);
        this.SetUserSessionsInfo(userSessionDetails);
    }

    public SetUserSessionsInfo(userSessionDetails) {
        this.setUserSessionsInfoItem(USERS_SESSSIONS_INFO, JSON.stringify(userSessionDetails));
    }

    public GetUserSessionsInfo() {
        let userSessions;
        const sessionDetails = this.getUserSessionsInfoItem(USERS_SESSSIONS_INFO);
        if (sessionDetails) {
            userSessions = JSON.parse(sessionDetails);
        }
        return userSessions;
    }

    public startTimer(logOffAfter: any, tokenExpiry: number) {
   
        if (logOffAfter == 0) {
          if (tokenExpiry > 122) {
            tokenExpiry = tokenExpiry - 122; // buffer time for token expiry
          }
          this.tokenTimer = timer(tokenExpiry * 1000);
          this.timerSubscription = this.tokenTimer.subscribe(n => {
            this.timerComplete(n, true);
          });
        }
        else {
          if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
          }
          this._timeoutSeconds = logOffAfter * 60;
          this.timer = timer(this._timeoutSeconds * 1000);
          this.timerSubscription = this.timer.subscribe(n => {
            this.timerComplete(n, false);
          });
        }
      }

    public stopTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
        if (this.tokenTimerSubscription) {
            this.tokenTimerSubscription.unsubscribe();
        }
    }

    public resetTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }

        this.timer = timer(this._timeoutSeconds * 1000);
        this.timerSubscription = this.timer.subscribe(async n => {
            await this.timerComplete(n, false);
        });
    }

    public forceLogOff() {
        // added empty method to avoid conflict in common
        // let jwtExpiryTime: any = localStorage.getItem('jwtExpiryTime');
        // jwtExpiryTime = new Date(jwtExpiryTime);
        // let currentTime: any = new Date();
        // let expirySeconds = jwtExpiryTime - currentTime;
        // if (!localStorage.getItem('popupEnabled')) {
        //   if (this.tokenTimerSubscription) {
        //     this.tokenTimerSubscription.unsubscribe();
        //   }
        //   if (expirySeconds > this.logOutWaitingtime) {
        //     expirySeconds = expirySeconds - this.logOutWaitingtime;
        //   }
        //   this.tokenTimer = timer(expirySeconds);
        //   this.tokenTimerSubscription = this.tokenTimer.subscribe(n => {
        //     this.timerComplete(n, true);
        //   });
        // }
        // else {
        //   if (expirySeconds > 0) {
        //     this.triggerTimeout = setTimeout(() => {
        //       this.logout();
        //     }, expirySeconds);
        //   }
        //   else {
        //     this.logout();
        //   }

        // }
    }

    private async timerComplete(n: number, displayAlert: boolean) {
        this.timeoutExpired.next(++this._count);
        if (!displayAlert) {
            this.logout();
        }
        else {
            this.utils.showAlert(this.localize.captions.AutologoffWarning, AlertType.Warning);
            localStorage.setItem('popupEnabled', 'true')
            this.triggerTimeout = setTimeout(() => {
                this.logout();
            }, this.logOutWaitingtime);
        }
    }

    private getPropertyName() {
        return this.localize.GetsessionStorageValue('propertyInfo', 'PropertyName');
    }

    private getUserSessionsInfoItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    private setUserSessionsInfoItem(key: string, value: string): void {
        localStorage.setItem(key, value);
        return sessionStorage.setItem(key, value);
    }

    private mapLoginDetailsToLocalModel(loginDetails) {
        return {
            token: loginDetails.token,
            expiresOn: new Date(),
            userLoginInfo: {
                firstName: loginDetails.userLoginInfo.firstName,
                lastName: loginDetails.userLoginInfo.lastName,
                isNewUser: loginDetails.userLoginInfo.isNewUser,
                isPasswordExpired: loginDetails.userLoginInfo.isPasswordExpired,
                languageCode: loginDetails.userLoginInfo.languageCode,
                productId: loginDetails.userLoginInfo.productId,
                propertyId: loginDetails.userLoginInfo.propertyId,
                tenantCode: loginDetails.userLoginInfo.tenantCode,
                tenantId: loginDetails.userLoginInfo.tenantId,
                userId: loginDetails.userLoginInfo.userId,
                isPropertyChangeAllow: loginDetails.userLoginInfo.isPropertyChangeAllow,
                userName: loginDetails.userLoginInfo.userName
            },
            userProperties: loginDetails.userProperties.map(userProperty => {
                return {
                    autoLogOff: userProperty.autoLogOff,
                    currencyCode: userProperty.currencyCode,
                    isActive: userProperty.isActive,
                    languageCode: userProperty.languageCode,
                    logOffAfter: userProperty.logOffAfter,
                    platformPropertyId: userProperty.platformPropertyId,
                    platformTenantId: userProperty.platformTenantId,
                    productId: userProperty.productId,
                    profitCenter: userProperty.profitCenter,
                    propertyCode: userProperty.propertyCode,
                    propertyDate: userProperty.propertyDate,
                    propertyId: userProperty.propertyId,
                    propertyName: userProperty.propertyName,
                    roleId: userProperty.roleId,
                    roleName: userProperty.roleName,
                    subPropertyCode: userProperty.subPropertyCode,
                    subPropertyId: userProperty.subPropertyId,
                    subPropertyName: userProperty.subPropertyName,
                    tenantId: userProperty.tenantId,
                    timeZone: userProperty.timeZone,
                    userId: userProperty.userId,
                    sessionId: null
                };
            })
        };
    }

    public startTimerForNotification(notifyin: number) {
        if (notifyin && notifyin > 0) {
            this.stopTimerForNotification();
            this.timerForNotification = timer(notifyin * 60 * 1000);
            this.timerSubscriptionForNotification = this.timerForNotification.subscribe(n => {
                this.timerCompleteForNotification(n);
            });
        }
    }

    private async timerCompleteForNotification(n: number) {
        try {
            if (this.propertyInformation.HasRevenuePostingEnabled) {
                const revenuePostingFailures = await this.getRevenuePostingCount();
                this.transactionCount.next([{ id : NotificationFailureType.revenuePostingFailure, count : revenuePostingFailures }]);
            }
            const paymenentFailures = await this.getTransactionLogCount();
            this.transactionCount.next([{ id : NotificationFailureType.paymentTransactionFailure, count : paymenentFailures }]);
            this.startTimerForNotification(10);
        }
        catch(err){
            if (err && err.status === 401) {
                this.stopTimerForNotification();
                return ;
            }
        }
    }


    public async getRevenuePostingCount(): Promise<number> {
        const response = await this.http.CallApiAsync<number>({
            callDesc: 'GetFailureRevenuePosting',
            host: Host.retailPOS,
            method: HttpMethod.Get,
            showError: true
        });
        return response.result;
    }

    public async getTransactionLogCount(): Promise<number> {
        const response = await this.http.CallApiAsync<number>({
            callDesc: 'GetFailureDetails',
            host: Host.payment,
            method: HttpMethod.Get,
            showError: true
        });
        return response.result;
        
    }

    public stopTimerForNotification() {
        if (this.timerSubscriptionForNotification) {
            this.timerSubscriptionForNotification.unsubscribe();
        }
    }
}
