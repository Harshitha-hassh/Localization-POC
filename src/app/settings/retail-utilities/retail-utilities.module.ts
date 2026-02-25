import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { SharedModule } from 'src/app/shared/shared.module';
import { SystemConfigModule } from 'src/app/retail/sytem-config/system-config.module';
import { RetailModule } from 'src/app/retail/retail.module';
import { RetailUtilitiesComponent } from './retail-utilities.component';
import { UtilitiesRoutingModule } from './retail-utilities-routing.module';
import { ReceiptConfigurationComponent } from './receipt-configuration/receipt-configuration.component';
import { RetailTemplatesComponent } from './retail-templates/retail-templates.component';
import { UserMachineConfigurationComponent } from './user-machine-configuration/user-machine-configuration.component';
import { QuickidConfigComponent } from './quickid-config/quickid-config.component';
import { ManagerUtilitiesComponent } from './manager-utilities/manager-utilities.component';
import { PrinterDefaultConfigurationComponent } from './manager-utilities/printer-default-configuration/printer-default-configuration.component';
import { ConfigValidationComponent } from 'src/app/common/config-validation/config-validation/config-validation.component';
import { CgpsLoggingProfileSyncWrapperComponent } from './cgps-logging-profile-sync-wrapper/cgps-logging-profile-sync-wrapper.component';
import { JobSchedulerComponent } from './job-scheduler/job-scheduler.component';
import { EventSchedulerConfigurationComponent } from 'src/app/common/shared/shared/event-scheduler-configuration/event-scheduler-configuration.component';
import { ReportSchedularWrapperComponent } from './report-scheduler-wrapper/report-schedular-wrapper.component';
import { EventSliderComponent } from './report-scheduler-wrapper/event-slider/event-slider.component';
import { RetailReportModule } from 'src/app/retail/retail-reports/reports.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
@NgModule({
    declarations: [RetailUtilitiesComponent, ReceiptConfigurationComponent, RetailTemplatesComponent, UserMachineConfigurationComponent, QuickidConfigComponent, ManagerUtilitiesComponent
        , PrinterDefaultConfigurationComponent, CgpsLoggingProfileSyncWrapperComponent, 
        JobSchedulerComponent, EventSchedulerConfigurationComponent, ReportSchedularWrapperComponent, EventSliderComponent],
    imports: [
        CommonModule,
        SharedModule,
        UtilitiesRoutingModule,
        SystemConfigModule,
        RetailModule,
        // ConfigValidationComponent,
        RetailReportModule,
        NgScrollbarModule
    ]
})
export class UtilitiesModule { }
