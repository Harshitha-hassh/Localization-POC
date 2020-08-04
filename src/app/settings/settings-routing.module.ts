
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
// import { RouteGuardService } from '../core/route-gaurd.service';
// import { UserAccessBreakPoints } from '../shared/enums/useraccess.constants';

const routes: Routes = [{
  path: '', component: SettingsComponent,
  children: [
    { path: '', redirectTo: 'retailsetup', pathMatch: 'full' },
    // {
    //   path: 'salessetup',
    //   loadChildren: () => import('../settings/setup/setup.module').then(m => m.SetupModule),
    //   data: { redirectTo: 'cateringsetup', hasChild: true }
    //   // data: { preload: true, breakPointNumber: UserAccessBreakPoints.SYSTEMSETUP, syncAccess: true, redirectTo: 'listmaintenance' },
    //   // canActivate: [RouteGuardService]
    // },
    // {
    //   path: 'cateringsetup',
    //   loadChildren: () => import('../settings/catering/catering.module').then(m => m.CateringModule),
    //   data: { redirectTo: 'budgetsetup', hasChild: true }
    // },
    // {
    //   path: 'listmaintenance',
    //   loadChildren: () => import('../settings/list-maintenance/list-maintenance.module').then(m => m.ListMaintenanceModule)
    // },
    // {
    //   path: 'budgetsetup',
    //   loadChildren: () => import('../settings/budget-setup/budget-setup.module').then(m => m.BudgetSetupModule),
    //   data: { redirectTo: 'revenuesetup', hasChild: true }
    // },
    // {
    //   path: 'revenuesetup',
    //   canActivate : [RouteGuardService],
    //   loadChildren: () => import('./revenue-setup/revenue-setup.module').then(m => m.RevenueSetupModule),
    //   data: { preload: true, breakPointNumber: UserAccessBreakPoints.REVENUESETUP, syncAccess: true, 
    //     redirectTo: 'proformainvoicesetup'}
    // },
    // {
    //   path: 'proformainvoicesetup',
    //  canActivate : [RouteGuardService],
    //   loadChildren: () => import('../settings/pro-forma-invoice-setup/pro-forma-invoice-setup.module').
    //     then(m => m.ProFormaInvoiceSetupModule),
    //   data: { preload: true, breakPointNumber: UserAccessBreakPoints.CONFIGUREPROFORMAINVOICE, syncAccess: true, 
    //    redirectTo: 'templatesetup'}
    // },
    // {
    //   path: 'templatesetup',
    //   loadChildren: () => import('../settings/template-setup/template-setup.module').then(m => m.TemplateSetupModule),
    //   data: { redirectTo: 'lettersetup', hasChild: true }
    // },
    // {
    //   path: 'beosetup',
    //   loadChildren: () => import('../settings/beo-setup/beo-setup.module').then(m => m.BeoSetupModule)
    // },
    {
      path: 'retailsetup',
      loadChildren: () => import('../retail/retail.module').then(m => m.RetailModule),
      data: {preload: true}
    }
    // {
    //   path: 'inventorysetup',
    //   loadChildren: () => import('../retail/Inventory/inventory.module').then(m => m.InventoryModule)
    // },
    // {
    //   path: 'commisionsetup',
    //   loadChildren: () => import('../retail/commission-setup/commission-setup.module').then(m => m.CommissionSetupModule)
    // },
    // {
    //   path: 'utilities',
    //   loadChildren: () => import('../settings/utilities/utilities.module').then(m => m.UtilitiesModule),
    //   data: { redirectTo: 'usersetup', hasChild: true }
    // },
    // {
    //   path: 'usersetup',
    //   loadChildren: () => import('../settings/user-setup/user-setup.module').then(m => m.UserSetupModule),
    //   data: { redirectTo: 'systemsetup', hasChild: true }
    // },
    // {
    //   path: 'systemsetup',
    //   loadChildren: () => import('../settings/system-setup/system-setup.module').then(m => m.SystemSetupModule)
    // },
    // {
    //   path: 'lettersetup',
    //   loadChildren: () => import('../settings/letter-setup/letter-setup.module').then(m => m.LetterSetupModule),
    //   data: { redirectTo: 'retailsetup', hasChild: true }
    // }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
