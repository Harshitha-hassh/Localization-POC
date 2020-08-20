import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { DashboardWidgetsReportComponent } from './dashboard-widgets-report/dashboard-widgets-report.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { NoDataFoundComponent } from './no-data-found/no-data-found.component';
import { ChartBarComponent } from './chart-bar/chart-bar.component';
import { ChartDonutComponent } from './chart-donut/chart-donut.component';
import { ChartLineComponent } from './chart-line/chart-line.component';
import { DashboardTableComponent } from './dashboard-table/dashboard-table.component';


@NgModule({
  declarations: [
    HomeComponent,
    DashboardWidgetsReportComponent,
    MultiSelectComponent,
    NoDataFoundComponent,
    ChartBarComponent,
    ChartDonutComponent,
    ChartLineComponent,
    DashboardTableComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
