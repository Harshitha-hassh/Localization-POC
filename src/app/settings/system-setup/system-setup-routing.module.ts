import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SystemSetupComponent } from './system-setup.component';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { RouteGuardService } from 'src/app/retail/shared/service/route-gaurd.service';
import { UserAccessBreakPoints } from 'src/app/retail/shared/constants/useraccess.constants';


const routes: Routes = [{
  path: '', component: SystemSetupComponent,
  // canActivate: [RouteGuardService],
  data: { breakPointNumber: UserAccessBreakPoints.SYSTEMSETUP, ShowPopup: true, isModule: true },
  children: [
    { path: '', redirectTo: 'propertyinfo', pathMatch: 'full' },
    {
      path: 'propertyinfo', component: PropertyInfoComponent,
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemSetupRoutingModule { }
