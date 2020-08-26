import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material-module';
import { SettingsService } from './settings.service';


@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    MaterialModule
  ],
  providers: [SettingsService]
})
export class SettingsModule { }
