import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginComponent } from '../login/login/login.component';
import { AppCustomPreloader } from './custom-preloader-strategy';

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
  {
    path: '',
    component: LayoutComponent,
    canActivate:[AuthGuardService],
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'client',
        loadChildren: () => import('../client/client.module').then(m => m.ClientModule)
      },
      {
        path: 'shop',
        loadChildren: () => import('../retail/shop/shop.module').then(m => m.ShopModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule),
      },
      {
        path: 'reports',
        loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule),
      },
      {
        path: 'audit',
        loadChildren: () => import('../audit/audit.module').then(m => m.AuditModule),
      }
    ]
  },
  {path:'**', redirectTo:'/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: AppCustomPreloader })],
  exports: [RouterModule],
  providers: [AppCustomPreloader]
})
export class CoreRoutingModule { }
