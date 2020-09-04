import { CommonModule } from '@angular/common';
import { CustomDateAdapter, MY_DATE_FORMATS } from '../core/localization/custom.dateAdapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { MaterialModule } from '../material-module';
import { RouterModule } from '@angular/router';
import { RetailStandaloneLocalization } from '../core/localization/retailStandalone-localization';
import { MenuComponent } from './components/menu/menu.component';
import { GlobalSearchComponent } from './components/global-search/global-search.component';
import { PopoverModule } from 'ngx-popover';
import { TenantManagementCommunication } from './communication/services/tenantmanagement.service';
import { AuthenticationCommunication } from './communication/services/authentication.service';
import { RetailManagementCommunication } from './communication/services/retailmanagement.service';
import { RetailPosCommunication } from './communication/services/retailpos.service';
import { TemplatesModule } from '../common/templates/templates.module';
import { RetailSharedModule } from '../retail/shared/retail-shared.module';
import { CommonSharedModule } from '../common/shared/shared/shared.module';
import { AboutComponent } from './components/about/about.component';
import { MsGraphAuthComponent } from './components/ms-graph-auth/ms-graph-auth.component';
import { ImgThumbnailComponent } from './components/img-thumbnail/img-thumbnail.component';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ClientPopupComponent } from '../client/client-popup/client-popup.component';
import { CreateClientComponent } from '../client/client-popup/create-client/create-client.component';
import { TransactionHistoryComponent } from '../client/client-popup/create-client/transaction-history/transaction-history.component';
import { PersonalInformationComponent } from '../client/client-popup/create-client/personal-information/personal-information.component';
import { AdditionalInformationComponent } from '../client/client-popup/create-client/additional-information/additional-information.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { CardTypeComponent } from './components/card-type/card-type.component';
import { UserAccessBusiness } from '../common/dataservices/authentication/useraccess.business';
import { UserAccessDataService } from '../common/dataservices/authentication/useraccess.data.service';
import { LocalizeDatePipe } from '../core/localization/localize-date.pipe';
import { ClientDataService } from './data-services/client.data.service';
import { AppModuleService } from '../core/services/app.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@NgModule({
  declarations: [
    MenuComponent,
    GlobalSearchComponent,
    AboutComponent,
    MsGraphAuthComponent,
    ImgThumbnailComponent,
    ImageUploaderComponent,
    ClientPopupComponent,
    CreateClientComponent,
    TransactionHistoryComponent,
    PersonalInformationComponent,
    AdditionalInformationComponent,
    CardTypeComponent,
    LocalizeDatePipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    PopoverModule,
    ReactiveFormsModule,
    TemplatesModule,
    RetailSharedModule,
    CommonSharedModule,
    GooglePlaceModule,
    NgxMaterialTimepickerModule.forRoot()
  ],
  providers: [
    TenantManagementCommunication,
    AuthenticationCommunication,
    RetailManagementCommunication,
    RetailPosCommunication,
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [RetailStandaloneLocalization,
        Platform]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_DATE_FORMATS
    },
    NgxImageCompressService,
    UserAccessDataService,
    ClientDataService,
    AppModuleService,
    UserAccessBusiness,
    LocalizeDatePipe
  ],
  exports: [
    FormsModule,
    MaterialModule,
    PopoverModule,
    MenuComponent,
    GlobalSearchComponent,
    ReactiveFormsModule,
    CommonSharedModule,
    ImgThumbnailComponent,
    MsGraphAuthComponent,
    CommonSharedModule,
    ImageUploaderComponent,
    CardTypeComponent,
    LocalizeDatePipe
  ],
  entryComponents: [
    AboutComponent,
    ClientPopupComponent
  ]
})
export class SharedModule { }
