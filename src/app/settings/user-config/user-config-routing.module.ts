import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserSetupComponent } from './user-setup/user-setup.component';
import { RoleSetupComponent } from './role-setup/role-setup.component';
import { UserConfigComponent } from './user-config.component';
import { UserRoleComponent } from './user-role/user-role.component';
// import { RouteGuardService } from 'src/app/retail/shared/service/route-gaurd.service';


const routes: Routes = [{
    path: '',
    component: UserConfigComponent,
    // canActivate: [RouteGuardService],
    data: { redirectTo: '', hasChild: true },
    children: [
        { path: '', redirectTo: 'usersetup', pathMatch: 'full' },
        {
            path: 'usersetup',
            component: UserSetupComponent,
            // canActivate: [RouteGuardService],
            // data: { breakPointNumber: SPAScheduleBreakPoint.UserSetup, redirectTo: '/settings/userconfig/rolesetup' }
        },
        {
            path: 'rolesetup',
            component: RoleSetupComponent,
            // canActivate: [RouteGuardService],
            // data: { breakPointNumber: SPAScheduleBreakPoint.UserRoleSetUp, redirectTo: '/settings/userconfig/userroleconfiguration' }
        },
        {
            path: 'userroleconfiguration',
            component: UserRoleComponent,
            // canActivate: [RouteGuardService],
            // data: { breakPointNumber: SPAScheduleBreakPoint.UserRoleConfiguration, redirectTo: '' }
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserSetupRoutingModule { }
