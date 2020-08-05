import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetailReportModule } from '../retail/retail-reports/reports.module';
import { SharedModule } from '../shared/shared.module';
import { DateAdapter } from '@angular/material';
import { Localization } from '../common/shared/localization/Localization';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportRetailComponent } from './report-retail/report-retail.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReportsRoutingModule,
    RetailReportModule
  ],
  declarations: [ReportsComponent, ReportRetailComponent],
  providers:[]
})
export class ReportsModule { 
    constructor(private adapter: DateAdapter<any>, private localization: Localization) {
        this.adapter.setLocale(localization.localeCode);
      }
}
