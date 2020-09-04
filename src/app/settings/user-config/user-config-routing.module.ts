import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserSetupComponent } from './user-setup/user-setup.component';
import { RoleSetupComponent } from './role-setup/role-setup.component';
import { UserConfigComponent } from './user-config.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { RouteGuardService } from 'src/app/core/services/route.guard.service';
import { BreakPoint } from 'src/app/shared/models/breakpoint-models';


const routes: Routes = [{
    path: '',
    component: UserConfigComponent,
    canActivate: [RouteGuardService],
    data: { checkAllSiblings: true, isModule: true, lastBreakPointNumber: BreakPoint.UserRoleConfiguration },
    children: [
        { path: '', redirectTo: 'usersetup', pathMatch: 'full' },
        {
            path: 'usersetup',
            component: UserSetupComponent,
            canActivate: [RouteGuardService],
            data: { breakPointNumber: BreakPoint.UserSetup, redirectTo: 'rolesetup', ShowPopup: false, syncAccess: true,  isSubmodule: true }
        },
        {
            path: 'rolesetup',
            component: RoleSetupComponent,
            canActivate: [RouteGuardService],
            data: { breakPointNumber: BreakPoint.UserRoleSetUp, redirectTo: 'userroleconfiguration', ShowPopup: false, syncAccess: true,  isSubmodule: true }
        },
        {
            path: 'userroleconfiguration',
            component: UserRoleComponent,
            canActivate: [RouteGuardService],
            data: { breakPointNumber: BreakPoint.UserRoleConfiguration, redirectTo: '',ShowPopup: false, syncAccess: true,  isSubmodule: true }
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserSetupRoutingModule { }
