import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { TransactionLogComponent } from './transaction-log/transaction-log.component';
import { RouteGuardService } from '../core/services/route.guard.service';
import { BreakPoint } from '../shared/models/breakpoint-models';

var routes: Routes = [{
  path: '', component: ReportsComponent,
  children: [
    { path: '', redirectTo: 'retail', pathMatch: 'full' },
    { path: 'retail', loadChildren: () => import('../retail/retail-reports/reports.module').then(m => m.RetailReportModule), data: { type: 'retail' } },
    { path: 'commissiongratuity', loadChildren: () => import('../retail/retail-reports/reports.module').then(m => m.RetailReportModule), data: { type: 'commission' } },
    { path: 'transactionlog', component: TransactionLogComponent, canActivate: [RouteGuardService],
      data: { breakPointNumber: BreakPoint.TransactionLog, syncAccess: true } },
    { path: 'giftcards', loadChildren: () => import('../retail/retail-reports/reports.module').then(m => m.RetailReportModule), data: { type: 'giftcards' } },
    { path: 'inventorycontrol', loadChildren: () => import('../retail/retail-reports/reports.module').then(m => m.RetailReportModule), data: { type: 'inventorycontrol' } }
    
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
