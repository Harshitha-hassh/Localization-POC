import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { TransactionLogComponent } from './transaction-log/transaction-log.component';
import { RouteGuardService } from '../core/services/route.guard.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BreakPoint } from '../shared/models/breakpoint-models';

var routes: Routes = [{
  path: '', component: ReportsComponent,
  children: [
    { path: '', redirectTo: 'retail', pathMatch: 'full' },
    { path: 'retail', loadChildren: '../retail/retail-reports/reports.module#RetailReportModule', data: { type: 'retail' } },
    { path: 'commissiongratuity', loadChildren: '../retail/retail-reports/reports.module#RetailReportModule', data: { type: 'commission' } },
    { path: 'transactionlog', component: TransactionLogComponent, canActivate: [RouteGuardService],
      data: { breakPointNumber: BreakPoint.TransactionLog, syncAccess: true } },
    { path: 'giftcards', loadChildren: '../retail/retail-reports/reports.module#RetailReportModule', data: { type: 'giftcards' } }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
