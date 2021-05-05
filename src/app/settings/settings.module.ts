import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material-module';
import { SettingsService } from './settings.service';
import { combineGuestRecordBusiness } from '../common/components/combine-guest-records/combine-guest-records.business';
import { CombineGuestRecordsService } from './retail-utilities/combine-guest-records/combine-guest-records.service';


@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    MaterialModule
  ],
  providers: [SettingsService,
    {
      provide: combineGuestRecordBusiness,
      useClass: CombineGuestRecordsService
    }]
})
export class SettingsModule { }
