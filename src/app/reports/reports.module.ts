import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportRetailComponent } from './report-retail/report-retail.component';
import { RetailReportModule } from '../retail/retail-reports/reports.module';
import { SharedModule } from '../shared/shared.module';


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
export class ReportsModule { }
