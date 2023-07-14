import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AlertAction, AlertType } from 'src/app/common/Models/common.models';
import { ButtonType } from 'src/app/common/enums/shared-enums';
import { Observable } from 'rxjs';
import { CommonUtilities } from 'src/app/common/shared/shared/utilities/common-utilities';
import { Localization } from 'src/app/common/localization/localization';
export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuardService implements CanDeactivate<CanComponentDeactivate>{
    excludePaths= [];
    shopPath;
    constructor(private localization: Localization, private _Utilities: CommonUtilities) {
        this.excludePaths= ["/shop/viewshop/order"];
        this.shopPath= "/shop/viewshop/retailitems";
    }

    canDeactivate(component: CanComponentDeactivate,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (component.canDeactivate) {
            return component.canDeactivate();
        }
        else {
            for (const val in component) {
                let allowPath = (currentState.url.includes(this.shopPath) && this.excludePaths.includes(nextState.url))
                if ( (component[val]) && typeof (component[val]) === 'object' && !allowPath) {
                    if (component[val].hasOwnProperty('status') && component[val].hasOwnProperty('pristine') && ((component[val].value.hasOwnProperty('isSearch') && !component[val].value.isSearch) || !component[val].value.hasOwnProperty('isSearch'))) {
                        if (component[val].dirty) {
                            return new Promise((resolve, reject) => {
                                this._Utilities.showAlert(this.localization.captions.settings.utilities.warn_datalost, AlertType.Warning, ButtonType.YesNo, (res) => {
                                    if (res === AlertAction.YES) {
                                        component[val].reset();
                                        resolve(true);
                                    } else {
                                        resolve(false);
                                    }
                                });
                            });
                        }
                    }
                }
            }
            return true;
        }
    }
}