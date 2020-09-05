import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { TransactionLogComponent } from './transaction-log/transaction-log.component';

const REPORT_TYPE = {
  "retail": "retail",
  "commission": "commission",
  "giftcard": "giftcards"
};
enum ReportMenu {
	transactionlog = 'transactionlog',
	retail = 'retail',
	commissiongratuity = 'commissiongratuity',
	giftcard = 'giftcards'
}

const routes: Routes = [{
  path: '', component: ReportsComponent,
  children: [
    { path: '', redirectTo: ReportMenu.retail, pathMatch: 'full' },    
    { path: ReportMenu.retail, loadChildren: 'src/app/retail/retail-reports/reports.module#RetailReportModule', data: { type: REPORT_TYPE.retail } },
    { path: ReportMenu.commissiongratuity, loadChildren: '../retail/retail-reports/reports.module#RetailReportModule', data: { type: REPORT_TYPE.commission } },
    { path: ReportMenu.transactionlog, component: TransactionLogComponent },    
    { path: ReportMenu.giftcard, loadChildren: 'src/app/retail/retail-reports/reports.module#RetailReportModule', data: { type: REPORT_TYPE.giftcard } }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
