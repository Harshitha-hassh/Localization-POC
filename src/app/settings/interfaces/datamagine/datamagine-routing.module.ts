import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserAccessBreakPoints } from 'src/app/common/constants/useraccess.constants';
import { DataMagineConfigComponent } from 'src/app/common/data-magine/data-magine-config/data-magine-config.component';
import { DataMagineComponent } from 'src/app/common/data-magine/data-magine/data-magine.component';
import { RouteGuardService } from 'src/app/core/services/route.guard.service';

const routes: Routes = [{
  path: '',
  component: DataMagineComponent,
  canActivate: [RouteGuardService],
  data: { checkAllSiblings: true, isSubmodule: true },
  children: [
    { path: '', redirectTo: 'datamagineConfiguration', pathMatch: 'full' },
    {
      path: 'datamagineConfiguration', component: DataMagineConfigComponent,
      // data: { breakPointNumber:2300   , isSubmodule: true, syncAccess: true, redirectTo: 'documentCodes'},
      // canActivate: [RouteGuardService]
    },
    {
      path: 'datamagineSettings', component: DataMagineConfigComponent,
      // data: { breakPointNumber:2300   , isSubmodule: true, syncAccess: true, redirectTo: 'documentCodes'},
      // canActivate: [RouteGuardService]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatamagineRoutingModule { }
