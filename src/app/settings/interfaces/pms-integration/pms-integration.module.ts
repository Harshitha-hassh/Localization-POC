import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { PMSIntegrationRoutingModule } from './pms-integration-routing.module';
import { PmsIntegrationComponent } from 'src/app/common/components/pmsintegration/pms-integration.component';
import { PmsSetupComponent } from 'src/app/common/components/pmsintegration/pms-setup/pms-setup.component';



@NgModule({
  declarations: [PmsIntegrationComponent, PmsSetupComponent],
  imports: [
    CommonModule,
    SharedModule,
    PMSIntegrationRoutingModule
  ]
})
export class PMSIntegrationModule { }
