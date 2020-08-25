import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserAccessBreakPoints } from 'src/app/retail/shared/constants/useraccess.constants';
import { RetailUtilitiesComponent } from './retail-utilities.component';
import { DistributionListComponent } from 'src/app/common/templates/distribution-list/distribution-list.component';
import { TemplatesComponent } from 'src/app/common/templates/templates.component';
import { RetailTemplatesComponent } from './retail-templates/retail-templates.component';
import { ReceiptConfigurationComponent } from './receipt-configuration/receipt-configuration.component';
import { UserMachineConfigurationComponent } from './user-machine-configuration/user-machine-configuration.component';


const routes: Routes = [{
  path: '', component: RetailUtilitiesComponent,
  // canActivate: [RouteGuardService],
  data: { breakPointNumber: UserAccessBreakPoints.SYSTEMSETUP, ShowPopup: true, isModule: true },
  children: [
    { path: '', redirectTo: 'propertyinfo', pathMatch: 'full' },
    {
        path:'receiptconfiguration',
        component: ReceiptConfigurationComponent,
        // canActivate: [RouteGuardService],
        // data: { breakPointNumber: RetailBreakPoint.ReceiptConfiguration, redirectTo: '/settings/utilities/usermachineconfiguration' }
      },
      {
        path: 'usermachineconfiguration',
        component: UserMachineConfigurationComponent,
        // canActivate: [RouteGuardService],
        // data: { breakPointNumber: RetailBreakPoint.UserSessionConfiguration, redirectTo: '/settings/utilities/templates' }
      },
      {
        path:'templates',
        component: RetailTemplatesComponent,
        children: [
          { path: '', redirectTo: 'email', pathMatch: 'full' },
          {
            path:'email',
            component: TemplatesComponent,
            data: { templateID: 1}
          },
          {
            path:'sms',
            component: TemplatesComponent,
            data: { templateID: 2}
          }
        ]
      },
      {
        path: 'distributionlist',
        component: DistributionListComponent,
      }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilitiesRoutingModule { }
