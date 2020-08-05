import { CommonModule } from '@angular/common';
import { CustomDateAdapter, MY_DATE_FORMATS } from '../core/localization/custom.dateAdapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from '../material-module';
import { RouterModule } from '@angular/router';
import { Localization } from '../core/localization/Localization';
import { MenuComponent } from './components/menu/menu.component';
import { GlobalSearchComponent } from './components/global-search/global-search.component';
import { PopoverModule } from 'ngx-popover';
import { TenantManagementCommunication } from './communication/services/tenantmanagement.service';
import { AuthenticationCommunication } from './communication/services/authentication.service';
import { RetailManagementCommunication } from './communication/services/retailmanagement.service';
import { TemplatesModule } from '../common/templates/templates.module';
import { RetailSharedModule } from '../retail/shared/retail-shared.module';


@NgModule({
  declarations: [
    MenuComponent,
    GlobalSearchComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    PopoverModule,
    ReactiveFormsModule,
    TemplatesModule,
    RetailSharedModule
  ],
  providers: [
    TenantManagementCommunication,
    AuthenticationCommunication,
    RetailManagementCommunication,
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [Localization,
        Platform]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_DATE_FORMATS
    }
  ],
  exports: [
    FormsModule,
    MaterialModule,
    PopoverModule,
    MenuComponent,
    GlobalSearchComponent,
    ReactiveFormsModule
  ],
  entryComponents: [
  ]
})
export class SharedModule { }
