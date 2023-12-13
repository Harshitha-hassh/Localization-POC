import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, ErrorHandler, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material-module';
import { CoreModule } from './core/core.module';
import { LoginModule } from './login/login.module';
import { RetailAppService } from './retail-app-service';
import { AppService } from './common/app-service';
import { Localization } from './common/localization/localization';
import { RetailStandaloneLocalization as RetailStandAloneLocalization } from './core/localization/retailStandalone-localization';
import { CommonPropertyInformation } from './common/shared/services/common-property-information.service';
import { RetailPropertyInformation } from './core/services/retail-property-information.service';
import { CommonUtilities } from './common/shared/shared/utilities/common-utilities';
import { Utilities } from './core/utilities';
import { ServiceLocator } from './common/service.locator';
import { AppModuleService } from './core/services/app.service';
import { GlobalErrorHandler } from './shared/service/global-error-handler.service';
import { ADB2CAuthConfiguration } from 'src/app/common/shared/auth.config';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { OAuthModule, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { StoreModule } from '@ngrx/store';
import { appReducers } from './eatecui/source/store/reducers/app.reducer';
import { clearState } from './eatecui/source/store/reducers/login.reducer';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { EnvService } from './eatecui/source/config.service';
let AppServiceFactory = (utilities: Utilities, localization: RetailStandAloneLocalization) => {
  return new RetailAppService(utilities, localization);
};

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
// export function appInitializerFactory(translate: TranslateService) {
//   return () => {
//     translate.setDefaultLang('en');
//     return translate.use('en').toPromise();
//   };
// }

declare module "@angular/core" {
  interface ModuleWithProviders<T = any> {
    ngModule: Type<T>;
    providers?: Provider[];
  }
}
export const OtherOptions: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 0,
  disableTooltipInteractivity: true,
}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    CoreModule,
    LoginModule,
    OAuthModule.forRoot(),
    StoreModule.forRoot(appReducers, { metaReducers: [clearState] }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    ToastrModule.forRoot()
  ],
  providers: [
    {
      provide: AppService,
      useFactory: AppServiceFactory,
      deps: [Utilities, RetailStandAloneLocalization]
    },
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    { provide: CommonUtilities, useExisting: Utilities },
    RetailPropertyInformation,
    { provide: Localization, useExisting: RetailStandAloneLocalization },
    { provide: CommonPropertyInformation, useExisting: RetailPropertyInformation },
    AppModuleService,
    {
      provide: OAuthService,
      useClass: OAuthService
    },
    {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: OtherOptions},
    {
      provide: APP_INITIALIZER,
      useFactory: (envService: EnvService) => () => envService.init(),
      multi: true,
      deps: [EnvService]
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: appInitializerFactory,
    //   deps: [TranslateService, Injector],
    //   multi: true
    // },
    UrlHelperService,
    ADB2CAuthConfiguration
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector, translate: TranslateService) {
    ServiceLocator.injector = this.injector;
    // translate.setDefaultLang('en');
    // translate.use('en');
  }
}
