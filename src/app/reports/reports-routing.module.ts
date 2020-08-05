import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ReportRetailComponent } from './report-retail/report-retail.component';


const routes: Routes = [{
  path: '', component: ReportsComponent,
  children: [
    { path: '', redirectTo: 'retail', pathMatch: 'full' },
    {
      path:  'retail',
      component: ReportRetailComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
