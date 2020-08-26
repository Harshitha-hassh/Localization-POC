import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuditComponent } from './audit.component';
import { DayEndComponent } from './audit-data/day-end/day-end.component';
import { SPAManagementBreakPoint } from '../common/shared/shared/globalsContant';
import { RouteGuardService } from '../retail/shared/service/route-gaurd.service';

// const routes: Routes = [
//     {
//         path: '',
//         redirectTo: 'dayend',
//         pathMatch: 'full'
//       },
//       {
//         path: 'dayend',
//         component: AuditComponent,
//         canActivate: [AuthGuardService],
//         children: [
//           { path: '', component: AuditDataComponent }
//         ]
//       }
// ];

const routes: Routes = [{
  path: '', component: AuditComponent,
  children: [
    { path: '', redirectTo: 'dayend', pathMatch: 'full' },
    {
      path: 'dayend',
      component: DayEndComponent,
      data: { redirectTo: ''}
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditRoutingModule { }
