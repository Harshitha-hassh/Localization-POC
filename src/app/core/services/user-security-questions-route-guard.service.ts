import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { UserSecurityQuestionBusinessService } from 'src/app/common/user-security-question/user-security-questions.business.service';
import { Utilities } from '../utilities';
import { Localization } from 'src/app/common/localization/localization';
import { AlertType } from 'src/app/common/Models/common.models';
import { ButtonType } from 'src/app/shared/shared-models';

@Injectable({
    providedIn: 'root'
})
export class UserSecurityQuestionsRouteGuard implements CanActivate {

    commonCaptions: any;

    constructor(
        private router: Router,
        private userSecurityBusinessService: UserSecurityQuestionBusinessService,
        private _utils: Utilities,
        private _localization: Localization
    ) {
        this.commonCaptions = this._localization.captions.common;
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        try {
            // Check if forget password is disabled using the business service
            const disableForgetPassword = this._utils.getSessionValue('DisableForgetPassword');
            let restrictAccess = disableForgetPassword ? disableForgetPassword == 'true' || true ? true : false : false;

            if (restrictAccess) {
                // If forget password is disabled, redirect to the parent settings page
                // You can customize this behavior based on your requirements
                this._utils.showAlert(
                this.commonCaptions.lbl_securityQuestionsReset,
                AlertType.Error,
                ButtonType.Ok
                );
                return false;
            }
            
            // Allow access if forget password is enabled
            return true;
        } catch (error) {
            console.error('Error in UserSecurityQuestionsRouteGuard:', error);
            // Allow access by default if there's an error to prevent blocking navigation
            return true;
        }
    }
}
