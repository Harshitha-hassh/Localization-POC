import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteGuardService } from 'src/app/core/services/route.guard.service';
import { InterfacesComponent } from './interfaces.component';

const routes: Routes = [{
  path: '',
  component: InterfacesComponent,
  canActivateChild: [RouteGuardService],
  canActivate: [RouteGuardService],
  data: { hasChild: true },
  children: [
    { path: '', redirectTo: 'dataMagine', pathMatch: 'full' },
    {
      path: 'dataMagine',
      loadChildren: () => import('./datamagine/datamagine.module').then(m => m.DatamagineModule)
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterfacesRoutingModule { }
