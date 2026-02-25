import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemSetupRoutingModule } from './system-setup-routing.module';
import { SystemSetupComponent } from './system-setup.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SystemConfigModule } from 'src/app/retail/sytem-config/system-config.module';
import { RetailModule } from 'src/app/retail/retail.module';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { ConfigValidationComponent } from 'src/app/common/config-validation/config-validation/config-validation.component';
import { ColorSketchModule } from 'ngx-color/sketch';
import { CommonSharedModule } from 'src/app/common/shared/shared/shared.module';
import { HomeDashboardConfigurationComponent } from './home-dashboard-configuration/home-dashboard-configuration.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

@NgModule({
    declarations: [SystemSetupComponent, PropertyInfoComponent, HomeDashboardConfigurationComponent],
    imports: [
        CommonModule,
        CommonSharedModule,
        SharedModule,
        SystemSetupRoutingModule,
        SystemConfigModule,
        RetailModule,
        // ConfigValidationComponent,
        ColorSketchModule,
        NgScrollbarModule
    ]
})
export class SystemSetupModule { }
