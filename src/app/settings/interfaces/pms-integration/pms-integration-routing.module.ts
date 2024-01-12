import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PmsIntegrationSetupComponent } from 'src/app/common/components/pms-integration-setup/pms-integration-setup.component';
import { PmsIntegrationComponent } from 'src/app/common/components/pmsintegration/pms-integration.component';
import { PmsSetupComponent } from 'src/app/common/components/pmsintegration/pms-setup/pms-setup.component';


const routes: Routes = [
  {
    path: '',
    component: PmsIntegrationComponent,
    children: [
      { path: '', redirectTo: 'pmsSetup', pathMatch: 'full' },
      {
        path: 'pmsSetup',
        component: PmsSetupComponent
      },
      {
        path : 'pmsIntegrationSetup',
        component: PmsIntegrationSetupComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PMSIntegrationRoutingModule { }
