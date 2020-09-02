import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientComponent } from './client.component';
import { AllClientsComponent } from './view-client/all-clients/all-clients.component';
import { RecentsComponent } from './view-client/recents/recents.component';
import { VipComponent } from './view-client/vip/vip.component';

const routes: Routes = [{
  path: '',
  component: ClientComponent,
  children: [
    { path: '', redirectTo: 'allclients', pathMatch: 'full' },
    {
      path: 'allclients',
      component: AllClientsComponent,
      data: { redirectTo: 'client/recents', hasChild: false }
    },
    {
      path:  'recents',
      component: RecentsComponent,
      data: { redirectTo: 'client/vip', hasChild: false }
    },
    // {
    //   path: 'vip',
    //   component: VipComponent,
    //   data: { redirectTo: '', hasChild: false }
    // },
    {
          path: 'allclients/:id',
          component: AllClientsComponent,
    }
  ]
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRountingModule { }
