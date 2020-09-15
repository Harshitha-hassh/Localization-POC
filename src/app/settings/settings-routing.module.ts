
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { RouteGuardService } from '../core/services/route.guard.service';
import { UserAccessBreakPoints } from '../retail/shared/constants/useraccess.constants';
// import { RouteGuardService } from '../core/route-gaurd.service';
// import { UserAccessBreakPoints } from '../shared/enums/useraccess.constants';

const routes: Routes = [{
  path: '', component: SettingsComponent,
  children: [
    { path: '', redirectTo: 'systemsetup', pathMatch: 'full' },
    {
      path: 'commisionsetup',
      loadChildren: () => import('../retail/commission-setup/commission-setup.module').then(m => m.CommissionSetupModule),
      canActivate: [RouteGuardService],
      data: { breakPointNumber: UserAccessBreakPoints.COMMISIONSETUP, redirectTo: 'retailsetup', syncAccess: true }
    },
    {
      path: 'retailsetup',
      loadChildren: () => import('../retail/retail.module').then(m => m.RetailModule),
      data: { preload: true }
    },
    {
      path: 'inventorysetup',
      loadChildren: () => import('../retail/Inventory/inventory.module').then(m => m.InventoryModule),
      canActivate: [RouteGuardService],
      data: { breakPointNumber: UserAccessBreakPoints.INVENTORYMANAGEMENT, redirectTo: 'systemsetup', syncAccess: true }
    },
    {
      path: 'systemsetup',
      loadChildren: () => import('./system-setup/system-setup.module').then(m => m.SystemSetupModule),
      data: { redirectTo: 'utilities', hasChild: true }
    },
    {
      path: 'utilities',
      loadChildren: () => import('../settings/retail-utilities/retail-utilities.module').then(m => m.UtilitiesModule),
      data: { redirectTo: 'userconfig', hasChild: true }
    },
    {
      path: 'userconfig',
      loadChildren: () => import('../settings/user-config/user-config.module').then(m => m.UserSetupModule),
      data: { redirectTo: 'enhancedInventory', hasChild: true }
    },
    {
      path: 'enhancedInventory',
      loadChildren: '../retail/eatec/eatec.module#EatecModule',
      data: { redirectTo: '', hasChild: false }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
