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
import { ReportsComponent } from './reports/reports.component';

let AppServiceFactory = () => {
  return new RetailAppService();
};


@NgModule({
  declarations: [
    AppComponent,
    ReportsComponent
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
      deps: []
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
