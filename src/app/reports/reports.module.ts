import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetailReportModule } from '../retail/retail-reports/reports.module';
import { SharedModule } from '../shared/shared.module';
import { DateAdapter } from '@angular/material/core';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportRetailComponent } from './report-retail/report-retail.component';
import { RetailLocalization } from '../retail/common/localization/retail-localization';
import { TransactionLogComponent } from './transaction-log/transaction-log.component';
import { ScrollbarModule } from 'ngx-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReportsRoutingModule,
    RetailReportModule,
    ScrollbarModule
  ],
  declarations: [ReportsComponent, ReportRetailComponent, TransactionLogComponent],
  providers:[]
})
export class ReportsModule { 
    constructor(private adapter: DateAdapter<any>, private localization: RetailLocalization) {
        this.adapter.setLocale(localization.localeCode);
      }
}
