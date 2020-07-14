import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginComponent } from '../login/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  // {
  //   path: '',
  //   component: LayoutComponent,
  //   canActivate:[AuthGuardService],
  //   children: [
  //     {
  //       path: 'home',
  //       loadChildren: '../home/home.module#HomeModule'
  //     },
     
  //   ]
  // },
  {path:'**', redirectTo:'/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
