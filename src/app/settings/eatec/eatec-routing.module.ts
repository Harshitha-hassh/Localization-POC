import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EatecComponent } from './eatec.component';
const routes: Routes = [
  {
    path: '',
    component: EatecComponent,
    children: [
      { path: '', redirectTo: 'masterlist', pathMatch: 'full' },
      {
        path: 'masterlist',
        loadChildren: () => import('src/app/eatecui/source/setup-master/master.module').then(m => m.MasterMangementModule),
      },
      {
        path: 'transaction',
        loadChildren: () => import('src/app/eatecui/source/transaction/transaction.module').then(m => m.TransactionModule)
      },
      {
        path: 'receiving',
        loadChildren: () => import('src/app/eatecui/source/transaction/transaction.module').then(m => m.TransactionModule)
      },
      {
        path: 'purchaseorder',
        loadChildren: () => import('src/app/eatecui/source/transaction/transaction.module').then(m => m.TransactionModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EatecRoutingModule { 
  EnableRetailIC:boolean;
  constructor(){
    let propConfig = sessionStorage.getItem('propConfig') ? JSON.parse(sessionStorage.getItem('propConfig')) : null;
    this.EnableRetailIC = propConfig? (propConfig.EnableRetailIC == 'true'? true: false): null;
    if(!this.EnableRetailIC){
      delete routes[0].children;
    }
  }
}
