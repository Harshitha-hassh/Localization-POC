import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserAccessBreakPoints } from 'src/app/retail/shared/constants/useraccess.constants';
import { RetailUtilitiesComponent } from './retail-utilities.component';
import { DistributionListComponent } from 'src/app/common/templates/distribution-list/distribution-list.component';
import { TemplatesComponent } from 'src/app/common/templates/templates.component';
import { RetailTemplatesComponent } from './retail-templates/retail-templates.component';
import { ReceiptConfigurationComponent } from './receipt-configuration/receipt-configuration.component';
import { UserMachineConfigurationComponent } from './user-machine-configuration/user-machine-configuration.component';
import { RouteGuardService } from 'src/app/core/services/route.guard.service';
import { BreakPoint } from 'src/app/shared/models/breakpoint-models';
import { QuickidConfigComponent } from './quickid-config/quickid-config.component';
import { AgCombineGuestRecordsComponent } from 'src/app/common/components/combine-guest-records/combine-guest-records.component';
import { DeactivateGuard } from 'src/app/core/services/Route-Guards/deactivate.guard.service';
import { ManagerUtilitiesComponent } from './manager-utilities/manager-utilities.component';
import { PrinterDefaultConfigurationComponent } from './manager-utilities/printer-default-configuration/printer-default-configuration.component';
import { UserAccessBreakPoints as CommonBreakPoint} from 'src/app/common/constants/useraccess.constants';


const routes: Routes = [{
  path: '', component: RetailUtilitiesComponent,
   //canActivate: [RouteGuardService],
  data: { breakPointNumber: UserAccessBreakPoints.SYSTEMSETUP, ShowPopup: true, isModule: true },
  children: [
    { path: '', redirectTo: 'receiptconfiguration', pathMatch: 'full' },
    {
        path:'receiptconfiguration',
        component: ReceiptConfigurationComponent,
        canActivate: [RouteGuardService],
        data: { breakPointNumber: BreakPoint.ReceiptConfiguration, redirectTo: 'usermachineconfiguration', syncAccess: true }
      },
      {
        path: 'usermachineconfiguration',
        component: UserMachineConfigurationComponent,
        canActivate: [RouteGuardService],
        data: { breakPointNumber: BreakPoint.UserSessionConfiguration, redirectTo: 'templates', syncAccess: true }
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
        component: DistributionListComponent
      },
      {
        path: 'quickidconfig',
        component: QuickidConfigComponent
      },      
      {
        path: 'combineguest',
        component: AgCombineGuestRecordsComponent,
        canActivate: [RouteGuardService], canDeactivate: [DeactivateGuard],
        data: { breakPointNumber: BreakPoint.CombineGuestRecords, redirectTo: 'combineguest', syncAccess: true }
      },
      {
        path: 'managerUtilities',
        component: ManagerUtilitiesComponent,
        canActivate: [RouteGuardService],
        data: { breakPointNumber: CommonBreakPoint.PRINTERDEFAULTCONFIGURATION, redirectTo: '', ShowPopup: true  } ,
        children: [
          { path: '', redirectTo: 'printerDefaultConfiguration', pathMatch: 'full' },        
          { path: 'printerDefaultConfiguration', 
            component: PrinterDefaultConfigurationComponent,
            canActivate: [RouteGuardService],canDeactivate: [DeactivateGuard],
            data: { breakPointNumber: CommonBreakPoint.PRINTERDEFAULTCONFIGURATION, redirectTo: '', ShowPopup: true  } 
          }
        ]
      }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilitiesRoutingModule { }
