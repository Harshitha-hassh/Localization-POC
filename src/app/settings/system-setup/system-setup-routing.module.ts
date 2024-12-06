import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SystemSetupComponent } from './system-setup.component';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { UserAccessBreakPoints } from 'src/app/retail/shared/constants/useraccess.constants';
import { MiscellaneousComponent } from 'src/app/retail/sytem-config/miscellaneous/miscellaneous.component';
import { NotificationConfigurationComponent } from 'src/app/common/templates/notification-configuration/notification-configuration.component';
import { HomeDashboardConfigurationComponent } from './home-dashboard-configuration/home-dashboard-configuration.component';
import { RouteGuardService } from 'src/app/core/services/route.guard.service';


const routes: Routes = [{
  path: '', component: SystemSetupComponent,
  canActivateChild: [RouteGuardService],
  canActivate: [RouteGuardService],
  data: {checkAllSiblings: true,lastBreakPointNumber: UserAccessBreakPoints.RETAILSYSTEMSETUP, isModule: true},
  children: [
    { path: '', redirectTo: 'propertyinfo', pathMatch: 'full' },
    {
      path: 'propertyinfo', component: PropertyInfoComponent,
      data: { breakPointNumber: UserAccessBreakPoints.RETAILSYSTEMSETUP, ShowPopup: true, isSubmodule: true }
    },
    {
      path: 'miscellaneous', component: MiscellaneousComponent,
    },
    {
      path: 'notifications', component: NotificationConfigurationComponent,
    },
    { path: 'dashboardConfiguration', 
      component: HomeDashboardConfigurationComponent, 
      data: { breakPointNumber: UserAccessBreakPoints.RETAILSYSTEMSETUP, ShowPopup: true, isSubmodule: true }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemSetupRoutingModule { }
