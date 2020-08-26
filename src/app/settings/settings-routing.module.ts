
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
// import { RouteGuardService } from '../core/route-gaurd.service';
// import { UserAccessBreakPoints } from '../shared/enums/useraccess.constants';

const routes: Routes = [{
  path: '', component: SettingsComponent,
  children: [
    { path: '', redirectTo: 'commisionsetup', pathMatch: 'full' },
    {
      path: 'commisionsetup',
      loadChildren: () => import('../retail/commission-setup/commission-setup.module').then(m => m.CommissionSetupModule)
    },
    {
      path: 'retailsetup',
      loadChildren: () => import('../retail/retail.module').then(m => m.RetailModule),
      data: {preload: true}
    },
    {
      path: 'inventorysetup',
      loadChildren: () => import('../retail/Inventory/inventory.module').then(m => m.InventoryModule)
    },
    {
      path: 'systemsetup',
      loadChildren: () => import('./system-setup/system-setup.module').then(m => m.SystemSetupModule)
    },
    {
      path: 'utilities',
      loadChildren: () => import('../settings/retail-utilities/retail-utilities.module').then(m => m.UtilitiesModule)
    },
    // {
    //   path: 'usersetup',
    //   loadChildren: () => import('../settings/user-setup/user-setup.module').then(m => m.UserSetupModule),
    //   data: { redirectTo: 'systemsetup', hasChild: true }
    // },
    
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
