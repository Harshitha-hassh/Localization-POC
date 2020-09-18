import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { TransactionLogComponent } from './transaction-log/transaction-log.component';
import { RouteGuardService } from '../core/services/route.guard.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BreakPoint } from '../shared/models/breakpoint-models';

export const REPORT_TYPE = {
  retail: 'retail',
  commission: 'commission',
  giftcard: 'giftcards'
};
export const ReportMenu = {
	transactionlog: 'transactionlog',
	retail: 'retail',
	commissiongratuity: 'commissiongratuity',
	giftcard: 'giftcards'
};

var routes: Routes = [{
  path: '', component: ReportsComponent,
  children: [
    { path: '', redirectTo: ReportMenu.retail, pathMatch: 'full' },
    { path: ReportMenu.retail, loadChildren: '../retail/retail-reports/reports.module#RetailReportModule', data: { type: REPORT_TYPE.retail } },
    { path: ReportMenu.commissiongratuity, loadChildren: '../retail/retail-reports/reports.module#RetailReportModule', data: { type: REPORT_TYPE.commission } },
    { path: ReportMenu.transactionlog, component: TransactionLogComponent, canActivate: [RouteGuardService],
      data: { breakPointNumber: BreakPoint.TransactionLog } },
    { path: ReportMenu.giftcard, loadChildren: '../retail/retail-reports/reports.module#RetailReportModule', data: { type: REPORT_TYPE.giftcard } }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
