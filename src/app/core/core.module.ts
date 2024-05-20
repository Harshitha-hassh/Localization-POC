import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreRoutingModule } from './core-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouteLoaderService } from './services/route-loader.service';
import { LayoutComponent } from './layout/layout.component';
import { SharedModule } from '../shared/shared.module';
import { CanDeactivateGuardService } from './services/can-component-deactivate.service';
import { HttpCacheService } from '../common/services/cache/http-cache.service';
import { CacheInterceptor } from '../common/services/cache/cache-interceptor';
import { ErrorInterceptor } from '@coreModels/interceptors/error.interceptor';



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
        HttpCacheService,    
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CacheInterceptor,
            multi: true,
        },  
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    exports: []
})
export class CoreModule { }

