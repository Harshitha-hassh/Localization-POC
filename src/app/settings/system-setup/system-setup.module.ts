import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemSetupRoutingModule } from './system-setup-routing.module';
import { SystemSetupComponent } from './system-setup.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SystemConfigModule } from 'src/app/retail/sytem-config/system-config.module';
import { RetailModule } from 'src/app/retail/retail.module';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { ColorSketchModule } from 'ngx-color/sketch';
import { CommonSharedModule } from 'src/app/common/shared/shared/shared.module';

@NgModule({
    declarations: [SystemSetupComponent, PropertyInfoComponent],
    imports: [
        CommonModule,
        CommonSharedModule,
        SharedModule,
        SystemSetupRoutingModule,
        SystemConfigModule,
        RetailModule,
        ColorSketchModule
    ]
})
export class SystemSetupModule { }
