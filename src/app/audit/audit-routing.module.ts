import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuditComponent } from './audit.component';
import { DayEndComponent } from './audit-data/day-end/day-end.component';
import { RouteGuardService } from '../core/services/route.guard.service';
import { BreakPoint } from '../shared/models/breakpoint-models';
import { NightAuditComponent } from 'src/app/common/night-audit/night-audit.component';

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
      canActivate: [RouteGuardService],
      data: { breakPointNumber: BreakPoint.DayEnd , redirectTo: '', ShowPopup: true, syncAccess: true }
    },
    {
      path: 'nightaudit', component: NightAuditComponent, canActivate: [RouteGuardService],
      // data: { BreakPointNumber: UserAccessBreakPoints.DAYEND, ShowPopup: true }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditRoutingModule { }
