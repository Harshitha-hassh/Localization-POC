import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router, CanActivateChild } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { PMSAction } from 'src/app/common/external-request/pms-request.model';
import { Utilities } from '../utilities';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';
import { BreakPointResult } from 'src/app/shared/models/breakpoint-models';

@Injectable({
    providedIn: 'root'
})
export class RouteGuardService implements CanActivate, CanActivateChild, OnDestroy {
    activatedChildresults: BreakPointResult[];
    destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    constructor(private userAccessBusiness: UserAccessBusiness, private router: Router, private _utilities : Utilities) {
        this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(x => {
            if (this.router.url === '/login') {
                this.activatedChildresults = null;
            }
        });
    }

    ngOnDestroy() {
        if (this.destroyed$) {
            this.destroyed$.next(true);
            this.destroyed$.complete();
        }
    }

    /**
     * @function GetCurrentUserBreakPointDetails
     * @param CurrentRoute ActivatedRouteSnapshot
     * @returns CurrentUserAccess UserBreakPoint
     * @description returns the breakpoint based on the BreakPoint number from route
     */
    async GetCurrentUserBreakPointDetails(CurrentRoute: ActivatedRouteSnapshot, ShowPopup?: boolean) {
        let CurrentUserAccess: Promise<BreakPointResult>;
        if (CurrentRoute.data && CurrentRoute.data.breakPointNumber) {
            CurrentUserAccess = this.userAccessBusiness.getUserAccess(CurrentRoute.data.breakPointNumber,
                ShowPopup ? ShowPopup : CurrentRoute.data.ShowPopup);
        }
        return CurrentUserAccess;
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return await this.checkAccess(route, state);
    }

    async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return await this.checkAccess(route, state);
    }

    // async checkPMSAccess(pmsSessioninfo: GolfPMSSessionInfo){
    //     let result : BreakPointResult;
    //     const searchActions: PMSAction[] = [PMSAction.CancelReservation,
    //                                         PMSAction.ReInstateReservation, PMSAction.RescheduleReservation, PMSAction.MoveReservation];
    //     if(pmsSessioninfo.action == PMSAction.Reservation){
    //         result = await this._userAccessBusiness.getUserAccess(UserAccessBreakPoints.TeeSheet, true);
    //     }
    //     else if(searchActions.includes(pmsSessioninfo.action)){
    //         result = await this._userAccessBusiness.getUserAccess(UserAccessBreakPoints.TeeTimeSearch, true);
    //     }
    //     if(!(result.isAllow || result.isViewOnly)){
    //         this.router.navigateByUrl('home');
    //         return false;
    //     }
    // }

    private async checkAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let CurrentUserAccess: BreakPointResult;
        const breakpoint = route.data.breakPointNumber;
        const checkSibling = route.data.checkAllSiblings;
        const isModule = route.data.isModule; // True if the current route is module level screen
        const isSubmodule = route.data.isSubmodule; // True if the current route is submodule level screen
        const routeHasChildAttr = checkSibling ? route.parent.data.hasChild : false;
        const extras = this.router.getCurrentNavigation().extras;
        const ShowPopup = route.data.ShowPopup || (extras.state && extras.state.ShowPopup);

         // True when current menu is submodule and it is clicked
        const isSubModuleChange = extras.state && extras.state.onSubmoduleChange && isSubmodule;

         // True when current menu is module and it is clicked
        const isModuleChange = extras.state && extras.state.onModuleChange && isModule;
        const redirectLocation = route.data.redirectTo;
        const lastBreakpoint = route.data.lastBreakPointNumber;
        const isFromPMS = this.router.url.indexOf('/Pms') !== -1;
        // const pmsSessioninfo: GolfPMSSessionInfo = this._utilities.getPMSSessionInfo();


        CurrentUserAccess = this.activatedChildresults && this.activatedChildresults.find(x => x.breakPointNumber === breakpoint);
        // Fetch all the current and child break point access detail
        if (!CurrentUserAccess || route.data.syncAccess) {
            await this.getChildBreakPointNos(route, breakpoint);
        }
        // if (isFromPMS) {
        //    await this.checkPMSAccess(pmsSessioninfo);
        // }

        // Check if all the siblings and current menu dont have access
        if (routeHasChildAttr &&  (!isSubModuleChange && !isModuleChange)) {
            const childBreakPoints = this.getChildBreakpoints(route);
            const isAnyHasAccess = childBreakPoints.some(x => {
                const currentChild = this.activatedChildresults.find(result => result.breakPointNumber === x.data.breakPointNumber);
                return currentChild.isAllow || currentChild.isViewOnly;
            });
            if (!isAnyHasAccess && isModule) {
                this.redirectToBetterPath(route.parent.data.redirectTo, route.parent, state);
                return false;
            }
            if (!isAnyHasAccess && isSubmodule) {
                this.redirectToBetterPath(redirectLocation, route, state);
                return false;
            }
        }

        // Check if all the siblings and current menu dont have access
        if (routeHasChildAttr && (isModuleChange || isSubModuleChange)) {
            const childBreakPoints = this.getChildBreakpoints(route);
            const isAnyHasAccess = childBreakPoints.some(x => {
                const currentChild = this.activatedChildresults.find(result => result.breakPointNumber === x.data.breakPointNumber);
                return currentChild.isAllow || currentChild.isViewOnly;
            });
            if (!isAnyHasAccess) {
            this.userAccessBusiness.showBreakPointError(lastBreakpoint);
            return false;
          }
        }

        // Unless route has breakpoint, allow access to the page
        if (!breakpoint) {
            return true;
        }
        // Show alert if break point alert set in route data
        CurrentUserAccess = this.activatedChildresults && this.activatedChildresults.find(x => x.breakPointNumber === breakpoint);
        if (CurrentUserAccess && !CurrentUserAccess.isAllow && !CurrentUserAccess.isViewOnly && ShowPopup) {
          this.userAccessBusiness.showBreakPointError(breakpoint);
        }

        // CurrentUserAccess = await this.GetCurrentUserBreakPointDetails(route, ShowPopup);
        if (CurrentUserAccess && (CurrentUserAccess.isViewOnly || CurrentUserAccess.isAllow)) {
            return (CurrentUserAccess.isViewOnly || CurrentUserAccess.isAllow);
        }
        if (redirectLocation && !ShowPopup) {
            this.redirectToBetterPath(redirectLocation, route, state);
        }
        return false;
    }

    async getChildBreakPointNos(route: ActivatedRouteSnapshot, breakpoint) {
        const breakPointNumbers = breakpoint ? [breakpoint] : [];
        if (route && route.routeConfig && route.routeConfig.children && route.routeConfig.children.length > 0) {
            route.routeConfig.children.forEach(child => {
                if (child) {
                    if (child && child.data && child.data.breakPointNumber) {
                        breakPointNumbers.push(child.data.breakPointNumber);
                    }
                    if (child.children && child.children.length > 0) {
                        child.children.forEach(y => {
                            if (y && y.data && y.data.breakPointNumber) {
                                breakPointNumbers.push(y.data.breakPointNumber);
                            }
                        });
                    }
                }
            });
        }
        const result = breakPointNumbers && breakPointNumbers.length > 0 &&
            await this.userAccessBusiness.getUserAccesses(breakPointNumbers);
        if (result) {
            if (!this.activatedChildresults) {
                this.activatedChildresults = result;
            } else {
                result.forEach(breakPt => {
                    const existingIdx = this.activatedChildresults.findIndex(x => x.breakPointNumber === breakPt.breakPointNumber);
                    if (existingIdx > -1) {
                        this.activatedChildresults[existingIdx] = breakPt;
                    } else {
                        this.activatedChildresults.push(breakPt);
                    }
                });
            }
        }

    }

    private redirectToBetterPath(redirectLocation, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const parentUrl = state.url
            .slice(0, state.url.indexOf(route.url[route.url.length - 1].path));
        this.router.navigate([parentUrl, redirectLocation]);
    }


    // Get all the child breakpoint data from parent route
    private getChildBreakpoints(route: ActivatedRouteSnapshot): any {
        const routes: any = [];
        const routeChildrens = route.routeConfig.children;
        if (routeChildrens && routeChildrens.length > 0) {
                routeChildrens.forEach(routeChildren => {
                if (routeChildren.data && routeChildren.data.breakPointNumber) {
                    routes.push(routeChildren);
                }
                const nestedChildrens =  routeChildren.children;
                if (nestedChildrens && nestedChildrens.length > 0) {
                    nestedChildrens.forEach(nestedChildren => {
                        if (nestedChildren.data && nestedChildren.data.breakPointNumber) {
                            routes.push(nestedChildren);
                        }
                    });
                }
            });
        }
        return routes;
}
}
