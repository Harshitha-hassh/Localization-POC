import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import * as _ from "lodash";
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { Utilities } from '../core/utilities';
import { TenantManagementCommunication } from '../shared/communication/services/tenantmanagement.service';
import { RetailRoutes } from '../core/extensions/retail-route';
import { JWT_TOKEN, REMEMBER_INFO, USER_SESSION } from '../core/app-constants';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class ManageSessionService implements OnDestroy {

    public resetOnTrigger: boolean = false;
    public timeoutExpired: Subject<number> = new Subject<number>();

    private _count: number = 0;
    userSessionId: string = "userSession";
    private _serviceId: string = 'idleTimeoutSvc-' + Math.floor(Math.random() * 10000);
    private _autoLogOff: boolean = false;
    private _logOffAfter: number;
    private _timeoutSeconds: number;
    private timerSubscription: Subscription;
    private timer: Observable<number>;

    token = {
        refresh_token: 'refreshtokencode',
        exp: '',
        access_token: {
            username: 'user',
            roles: ['Admin', 'RegisteredUser', 'Super User']
        }
    };

    scope: string = "Spa"
    state: string = Date.now() + "" + Math.random();
    tokenKey: string = "a5smm_utoken"
    propertyKey: string = "propertyInfo"
    url: string = "";
    tenantId: any = 1;
    locations: any[];
    propertyValues: any[];

    rememberDetail: any[] = [{ name: "" }];

    constructor(private router: Router
        , public dialogRef: MatDialog
        , public loginService: TenantManagementCommunication
        , private utils: Utilities) {

        this.timeoutExpired.subscribe(n => {
        });
    }

    goToLogin() {
        this.router.navigate(['login']);
    }

    ngOnDestroy() {
        this.timeoutExpired.unsubscribe();
    }

    async logout() {
        this.doLogoutActivities();
        await this.updateSession();
        this.removeToken();
        this.dialogRef.closeAll();
        this.clearLocalStore();
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
        return JSON.parse(sessionStorage.getItem(this.tokenKey))['access_token'];
    }

    isAuthenticated() {
        let token = sessionStorage.getItem(this.tokenKey);

        if (token) {
            return true;
        }
        else {
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
        let rememberDetails = sessionStorage.getItem(REMEMBER_INFO);
        sessionStorage.clear();
        sessionStorage.setItem(REMEMBER_INFO, rememberDetails);
    }

    StoreUser(user: string) {
        let rememberList = this.GetRememberedUsers();
        if (rememberList.find(x => x.name == user)) return;
        rememberList = [{ name: user }];
        sessionStorage.setItem(REMEMBER_INFO, JSON.stringify(rememberList));
    }

    RemoveUser(user) {
        let storedUsers = this.GetRememberedUsers();
        let updatedStore = _.remove(storedUsers, (u) => {
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
        let userName = this.utils.GetUserInfo("userName");
        if (userName != null && userName != undefined && userName != "null" && userName != "undefined") {
            await this.serverLogOut(userName);
        }
        this.router.navigate(['login']);
    }

    serverLogOut(userName: string) {
        let tenantId = this.utils.GetPropertyInfo('TenantId');
        let propertyId: number = Number(this.utils.GetPropertyInfo('PropertyId'));

        let uriParams = {
            Username: userName
            , TenantId: tenantId
            , PropertyId: propertyId
        };

        let serviceParams = {
            route: RetailApiRoute.LogOut,
            uriParams: uriParams,
            header: '',
            body: '',
            showError: false,
            baseResponse: true
        };

        return this.loginService.postPromise(serviceParams);
    }

    createSession(): Promise<number> {

        let userId: number = Number(this.utils.GetUserInfo('userId'));
        let propertyId: number = Number(this.utils.GetPropertyInfo('PropertyId'));
        let productId: number = Number(this.utils.GetPropertyInfo('ProductId'));
        let timeZone = this.utils.GetPropertyInfo('TimeZone');
        let userToken = sessionStorage.getItem(JWT_TOKEN);

        let sessionData = {
            userId: userId,
            startTime: moment().format("YYYY-MM-DDTHH:mm:ss"),
            propertyId: propertyId,
            productId: productId,
            timeZone: timeZone,
            userToken: userToken
        };

        let serviceParams = {
            route: RetailRoutes.CreateSession,
            uriParams: "",
            header: "",
            body: sessionData,
            showError: true,
            baseResponse: true
        };

        return this.loginService.postPromise<number>(serviceParams);
    }

    async updateSession() {        

        let sessionData = {
            isActive: false,
            endTime: moment().format("YYYY-MM-DDTHH:mm:ss"),
        };

        const sessionId:string = sessionStorage.getItem(this.userSessionId);
        if (!sessionId) {
             return;
        }
        let serviceParams = {
            route: RetailRoutes.UpdateSession,
            uriParams: { sessionId: sessionId },
            header: "",
            body: sessionData,
            showError: true,
            baseResponse: true
        };

        await this.loginService.putPromise(serviceParams);
    }

    public startTimer(logOffAfter: any) {
        if (logOffAfter == 0) {
            logOffAfter = this._logOffAfter;
        }

        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
        this._timeoutSeconds = logOffAfter * 60;
        this.timer = timer(this._timeoutSeconds * 1000);
        this.timerSubscription = this.timer.subscribe(n => {
            this.timerComplete(n);
        });
    }

    public stopTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    public resetTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }

        this.timer = timer(this._timeoutSeconds * 1000);
        this.timerSubscription = this.timer.subscribe(async n => {
            await this.timerComplete(n);
        });
    }

    private async timerComplete(n: number) {
        this.timeoutExpired.next(++this._count);
        await this.logout();
    }
}
