import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material-module';
import { CoreModule } from './core/core.module';
import { LoginModule } from './login/login.module';
import { RetailAppService} from './retail-app-service';
import { AppService } from './common/app-service';
import { Localization } from './common/localization/localization';
import { RetailStandaloneLocalization as RetailStandAloneLocalization } from './core/localization/retailStandalone-localization';
import { CommonPropertyInformation } from './common/shared/services/common-property-information.service';
import { RetailPropertyInformation } from './core/services/retail-property-information.service';
import { CommonUtilities } from './common/shared/shared/utilities/common-utilities';
import { Utilities } from './core/utilities';
let AppServiceFactory = (utilities: Utilities, localization:RetailStandAloneLocalization) => {
  return new RetailAppService(utilities,localization);
};


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
    LoginModule
  ],
  providers: [
    {
      provide:AppService,
      useFactory: AppServiceFactory,
      deps: [Utilities, RetailStandAloneLocalization]
    },
    {provide:CommonUtilities, useClass:Utilities},
     RetailPropertyInformation,
    { provide:Localization, useClass:RetailStandAloneLocalization },
    {provide: CommonPropertyInformation, useClass: RetailPropertyInformation },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
