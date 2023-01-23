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

@NgModule({
    declarations: [RetailUtilitiesComponent, ReceiptConfigurationComponent, RetailTemplatesComponent, UserMachineConfigurationComponent, QuickidConfigComponent, ManagerUtilitiesComponent, PrinterDefaultConfigurationComponent],
    imports: [
        CommonModule,
        SharedModule,
        UtilitiesRoutingModule,
        SystemConfigModule,
        RetailModule
    ]
})
export class UtilitiesModule { }
