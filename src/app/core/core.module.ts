import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreRoutingModule } from './core-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { RouteLoaderService } from './services/route-loader.service';
import { LayoutComponent } from './layout/layout.component';
import { SharedModule } from '../shared/shared.module';
import { CanDeactivateGuardService } from './services/can-component-deactivate.service';




@NgModule({
    declarations: [LayoutComponent],
    imports: [
        CommonModule,
        CoreRoutingModule,
        HttpClientModule,
        SharedModule
    ],
    providers: [
        RouteLoaderService,
        CanDeactivateGuardService,
    ],
    exports: []
})
export class CoreModule { }

