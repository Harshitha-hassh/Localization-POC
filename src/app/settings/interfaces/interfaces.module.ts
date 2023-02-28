import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InterfacesRoutingModule } from './interfaces-routing.module';
import { InterfacesComponent } from './interfaces.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    InterfacesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InterfacesRoutingModule
  ]
})
export class InterfacesModule { }
