import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { DashboardWidgetsReportComponent } from './dashboard-widgets-report/dashboard-widgets-report.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';


@NgModule({
  declarations: [
    HomeComponent,
    DashboardWidgetsReportComponent,
    MultiSelectComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
