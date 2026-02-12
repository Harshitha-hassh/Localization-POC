import { CommonModule } from '@angular/common';
import { CustomDateAdapter, MY_DATE_FORMATS } from '../core/localization/custom.dateAdapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { MaterialModule } from '../material-module';
import { RouterModule } from '@angular/router';
import { RetailStandaloneLocalization } from '../core/localization/retailStandalone-localization';
import { MenuComponent } from './components/menu/menu.component';
import { RetailGlobalSearchComponent } from './components/global-search/global-search.component';
import { PopoverModule } from "ngx-bootstrap/popover";
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
import { IdentificationDetailsComponent } from '../client/client-popup/create-client/identification-details/identification-details.component';
import { CardTypeComponent } from './components/card-type/card-type.component';
import { UserAccessBusiness } from '../common/dataservices/authentication/useraccess.business';
import { UserAccessDataService } from '../common/dataservices/authentication/useraccess.data.service';
import { LocalizeDatePipe } from '../core/localization/localize-date.pipe';
import { ClientDataService } from './data-services/client.data.service';
import { RetailItemDataService } from './data-services/retail-management/retail-item.data.service';
import { RedenderingOptionComponent } from './components/global-search/rendering-options/rendering.options.component';
import { ImageValiation } from './pipes/image-validation.pipe';
import { ConvertObjPipe } from './pipes/conver-object.pipe';
import { FormatTextPipe } from './pipes/formatText-pipe.pipe';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NotifyPopupComponent } from './components/notify-popup/notify-popup.component';
import { NotificationDataService } from './data-services/notification.data.service';
import { AllowedSpecialCharacterDirective } from './directives/allowedSpecialCharacter.directive';
import { RetailIntegrationLogService } from '../retail/shared/service/retail-integrationLog.service';
import {MatGoogleMapsAutocompleteModule} from '@angular-material-extensions/google-maps-autocomplete';
import { GOOGLE_MAP_API_KEY } from '../common/shared/shared/setupConstants';
@NgModule({
    declarations: [
        MenuComponent,
        RetailGlobalSearchComponent,
        AboutComponent,
        MsGraphAuthComponent,
        ImgThumbnailComponent,
        ImageUploaderComponent,
        ClientPopupComponent,
        CreateClientComponent,
        TransactionHistoryComponent,
        PersonalInformationComponent,
        AdditionalInformationComponent,
        IdentificationDetailsComponent,
        CardTypeComponent,
        LocalizeDatePipe,
        RedenderingOptionComponent,
        ConvertObjPipe,
        NotifyPopupComponent,
        ImageValiation,
        FormatTextPipe,
        AllowedSpecialCharacterDirective
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
        NgxMaterialTimepickerModule,
        MatGoogleMapsAutocompleteModule.forRoot(GOOGLE_MAP_API_KEY)
    ],
    providers: [
        TenantManagementCommunication,
        AuthenticationCommunication,
        RetailManagementCommunication,
        RetailPosCommunication,
        RetailIntegrationLogService,
        NotificationDataService,
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
        UserAccessBusiness,
        LocalizeDatePipe,
        RetailItemDataService,
        FormatTextPipe
    ],
    exports: [
        FormsModule,
        MaterialModule,
        PopoverModule,
        MenuComponent,
        RetailGlobalSearchComponent,
        ReactiveFormsModule,
        CommonSharedModule,
        ImgThumbnailComponent,
        MsGraphAuthComponent,
        ImageUploaderComponent,
        CardTypeComponent,
        LocalizeDatePipe,
        RedenderingOptionComponent,
        ConvertObjPipe,
        ImageValiation,
        FormatTextPipe,
        AllowedSpecialCharacterDirective
    ]
})
export class SharedModule { }
