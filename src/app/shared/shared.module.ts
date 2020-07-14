import { CommonModule } from '@angular/common';
import { CustomDateAdapter, MY_DATE_FORMATS } from '../core/localization/custom.dateAdapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { FormsModule } from '@angular/forms';
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
    PopoverModule
  ],
  providers: [
    TenantManagementCommunication,
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
    GlobalSearchComponent
  ],
  entryComponents: [
  ]
})
export class SharedModule { }
