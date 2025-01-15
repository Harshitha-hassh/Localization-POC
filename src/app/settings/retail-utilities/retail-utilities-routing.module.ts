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
import { UserAccessBreakPoints as CommonBreakPoint } from 'src/app/common/constants/useraccess.constants';
import { EnahancedInventoryMasterSyncComponent } from '../../retail/enahanced-inventory-master-sync/enahanced-inventory-master-sync.component';
import { ConfigValidationComponent } from 'src/app/common/config-validation/config-validation/config-validation.component';
import { CgpsLoggingProfileSyncWrapperComponent } from './cgps-logging-profile-sync-wrapper/cgps-logging-profile-sync-wrapper.component';
import { DiscountMappingComponent } from 'src/app/retail/discount-mapping/discount-mapping.component';
import { JobSchedulerComponent } from './job-scheduler/job-scheduler.component';
import { SftpLandingComponent } from 'src/app/common/sftp/sftp-landing/sftp-landing.component';
import { EventSchedulerConfigurationComponent } from 'src/app/common/shared/shared/event-scheduler-configuration/event-scheduler-configuration.component';
import { ReportSchedularWrapperComponent } from './report-scheduler-wrapper/report-schedular-wrapper.component';
import { InventoryLandingComponent } from 'src/app/retail/inventory-landing/inventory-landing.component';
import { InventoryStagingComponent } from 'src/app/retail/inventory-staging/inventory-staging.component';
import { OtherComponentsDiscountMappingComponent } from 'src/app/retail/other-components-discount-mapping/other-components-discount-mapping.component';


const routes: Routes = [{
  path: '', component: RetailUtilitiesComponent,
  //canActivate: [RouteGuardService],
  data: { breakPointNumber: UserAccessBreakPoints.SYSTEMSETUP, ShowPopup: true, isModule: true },
  children: [
    { path: '', redirectTo: 'receiptconfiguration', pathMatch: 'full' },
    {
      path: 'receiptconfiguration',
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
      path: 'templates',
      component: RetailTemplatesComponent,
      canActivate: [RouteGuardService],
      data: { hasChild: true },
      children: [
        { path: '', redirectTo: 'email', pathMatch: 'full' },
        {
          path: 'email',
          component: TemplatesComponent,
          canActivate: [RouteGuardService],
          data: { templateID: 1 , breakPointNumber:CommonBreakPoint.EmailTemplate , redirectTo: 'sms',syncAccess: true}
        },
        {
          path: 'sms',
          component: TemplatesComponent,
          canActivate: [RouteGuardService],
          data: { templateID: 2, breakPointNumber:CommonBreakPoint.SMSTemplate , redirectTo: '' ,syncAccess: true,ShowPopup: true}
        }
      ]
    },
    {
      path: 'distributionlist',
      component: DistributionListComponent,
      canActivate: [RouteGuardService],
      data: { breakPointNumber:CommonBreakPoint.DistributionList , redirectTo: 'quickidconfig' ,syncAccess: true}
    },
    {
      path: 'quickidconfig',
      component: QuickidConfigComponent,
      canActivate: [RouteGuardService], canDeactivate: [DeactivateGuard],
      data: { breakPointNumber: CommonBreakPoint.QUICKIDCONFIG, redirectTo: 'combineguest', syncAccess: true }
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
      data: { breakPointNumber: CommonBreakPoint.PRINTERDEFAULTCONFIGURATION, redirectTo: '', syncAccess: true },
      children: [
        { path: '', redirectTo: 'printerDefaultConfiguration', pathMatch: 'full' },
        {
          path: 'printerDefaultConfiguration',
          component: PrinterDefaultConfigurationComponent,
          canActivate: [RouteGuardService], canDeactivate: [DeactivateGuard],
          data: { breakPointNumber: CommonBreakPoint.PRINTERDEFAULTCONFIGURATION, redirectTo: '', syncAccess: true }
        }
      ]
    },
    {
      path: 'inventory', 
      component: InventoryLandingComponent,
      canActivate: [RouteGuardService],
      data: { hasChild: true },
      children: [
        { path: '', redirectTo: 'inventorysync', pathMatch: 'full' },
        {
          path: 'inventorysync', component: EnahancedInventoryMasterSyncComponent,
          canActivate: [RouteGuardService],
          data: { templateID: 1, 
          breakPointNumber: BreakPoint.InventorySync ,
          redirectTo: 'inventorystaging'}
        },
        { 
          path: 'inventorystaging', component: InventoryStagingComponent,
          canActivate: [RouteGuardService],
          data: { templateID: 2 ,
          breakPointNumber: BreakPoint.INVENTORYSTAGING,
          redirectTo: '',ShowPopup: true}
         },
      ]
    },
    {
      path: 'configValidation',
      component: ConfigValidationComponent,
      canActivate: [RouteGuardService], canDeactivate: [DeactivateGuard]
    },
    {
      path: 'cgpsFailedProfile', 
      component: CgpsLoggingProfileSyncWrapperComponent,
      canActivate: [RouteGuardService], canDeactivate: [DeactivateGuard],
      data: { showtableRecords: true },
    },
    {
      path: 'discountMapping',
      component: OtherComponentsDiscountMappingComponent,
      canActivate: [RouteGuardService], canDeactivate: [DeactivateGuard],
      data: { breakPointNumber: CommonBreakPoint.ADDEDITDISCOUNTMAPPING, redirectTo: '', syncAccess: true }
    }, {
      path: 'jobScheduler',
      component: JobSchedulerComponent,
      canActivate: [RouteGuardService],
      data: {redirectTo: '', syncAccess: true },
      children: [
        { path: '', redirectTo: 'sftp', pathMatch: 'full' },
        {
          path: 'sftp',
          component: SftpLandingComponent,
          canActivate: [RouteGuardService],
          data: { breakPointNumber: CommonBreakPoint.SFTP, redirectTo: '', syncAccess: true,ShowPopup: true }
        },
        {
          path: 'jobSchedulerConfig',
          component: EventSchedulerConfigurationComponent,
          canActivate: [RouteGuardService],
          data: { breakPointNumber: CommonBreakPoint.JOBSCHEDULERCONFIG, redirectTo: '', syncAccess: true,ShowPopup: true }
        },
        {
          path: 'eventScheduler',
          component: ReportSchedularWrapperComponent,
          canActivate: [RouteGuardService],
          data: { breakPointNumber: CommonBreakPoint.EVENTSCHEDULER, redirectTo: '', syncAccess: true,ShowPopup: true }
        }
      ]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilitiesRoutingModule { }
