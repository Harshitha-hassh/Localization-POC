import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, ErrorHandler } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { OAuthModule } from 'angular-oauth2-oidc';
import { GlobalErrorHandler } from './shared/service/global-error-handler.service';
let AppServiceFactory = (utilities: Utilities, localization: RetailStandAloneLocalization) => {
  return new RetailAppService(utilities, localization);
};

declare module "@angular/core" {
  interface ModuleWithProviders<T = any> {
    ngModule: Type<T>;
    providers?: Provider[];
  }
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
    OAuthModule.forRoot()
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
    AppModuleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    ServiceLocator.injector = this.injector;
  }
}
