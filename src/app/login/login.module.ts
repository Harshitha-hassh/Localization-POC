import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from '../material-module';
import { ReactiveFormsModule } from '@angular/forms';
import { SetPasswordComponent } from './set-password/set-password.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { PlatformModule } from '@angular/cdk/platform';
import { PropertySettingDataService } from '../shared/data-services/authentication/propertysetting.data.service';
import { LoaderInterceptor } from '../core/services/loader.interceptor.service';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SetPropertyComponent } from './set-property/set-property.component';

@NgModule({
    declarations: [
        LoginComponent,
        SetPasswordComponent,
        SetPropertyComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
        PlatformModule,
        BrowserModule,
        HttpClientModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoaderInterceptor,
            multi: true,
        },
        PropertySettingDataService
    ],
    exports: [LoginComponent, SetPasswordComponent]
})
export class LoginModule { }
