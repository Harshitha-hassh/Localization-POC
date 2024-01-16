import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../retail/material-module';
import { ScrollbarModule } from 'ngx-scrollbar';
import { RetailSharedModule } from '../../retail/shared/retail-shared.module';
import { EatecRoutingModule } from './eatec-routing.module';
import { EatecSharedModule } from 'src/app/eatecui/source/shared/shared.module';
import { EatecComponent } from './eatec.component';
import { AgilysysPopupModule } from 'src/app/eatecui/source/agilysys-popup/agilysys-popup.module';
@NgModule({
    declarations: [EatecComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        ScrollbarModule,
        EatecRoutingModule,
        RetailSharedModule,
        EatecSharedModule,
        AgilysysPopupModule
    ],
    exports: [],
    providers: []
})
export class EatecModule { }
