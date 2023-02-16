import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PropertyInformation } from '../../../../core/services/property-information.service';
import { SubscriptionLike as ISubscription, Subscription, ReplaySubject } from 'rxjs';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { Module, Host } from 'src/app/common/shared/shared/globalsContant';
import { UserSessionConfiguration } from 'src/app/common/shared/retail.modals';
import { UserMachineConfigurationService } from 'src/app/retail/common/services/user-machine-configuration.service';
import { BaseResponse, ClientCreditCardInfo } from 'src/app/common/shared/shared/business/shared.modals';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { PayAgentService } from 'src/app/retail/shared/service/payagent.service';
import { ExportSendComponent } from 'src/app/common/export-send/export-send.component';
import { ConsentManagementComponent } from 'src/app/common/consent-management/consent-management.component';
import { DataRetentionComponent} from 'src/app/common/data-retention/data-retention.component'
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
  providers:[UserMachineConfigurationService],
  encapsulation:ViewEncapsulation.None
})
export class AdditionalInformationComponent implements OnInit, OnDestroy {
  @Input() parentForm: UntypedFormGroup;
  cardConnectDialog: MatDialogRef<any, any>;

  additionalDetails: any = [];
  FormGrp: UntypedFormGroup;
  minFromDate: any;
  customFieldInfo: any = [];
  isTitleHidden: boolean = true;
  clientConfiguration: any = [];
  customFieldHidden: any = [true, true, true, true, true];
  customFieldDesc: any = ['', '', '', '', ''];
  customFieldValues: any = [[], [], []];
  captions: any;
  showToggle: boolean;
  cardInfo: ClientCreditCardInfo[] = [];  
  formSubscription: ISubscription;
  
  cardType = 'visa';
  EncryptedCardData: string = '';
  userSessionConfiguration: UserSessionConfiguration;
  IDTechCardSwipePopupClosed: boolean = false;
  clientWindowConvertion: Subscription;
  isFirstTime: boolean = true;
  isClientViewOnly = false;
  additionalInfo :any;
  PaymentReferenceID = 0;
  floatLabel: string;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input('inputData')
  set formData(value) {
    if(value && value.data!='')
    {
      this.additionalInfo = value.data;
      this.SetEditValues(value.data);
      this.isClientViewOnly = value.isClientViewOnly ? value.isClientViewOnly : false;
    }
  }
  constructor(
    private Form: UntypedFormBuilder, 
    private http: HttpServiceCall,
    public localization: RetailLocalization, 
    public dialog: MatDialog, 
    private utils: RetailUtilities, 
    private PropertyInfo: PropertyInformation,
    private payAgentService: PayAgentService, 
    private userMachineConfigurationService: UserMachineConfigurationService
    ) {
    this.captions = this.localization.captions.bookAppointment;
    this.floatLabel = this.localization.setFloatLabel;

    this.FormGrp = this.Form.group({
      // pricetype: 0,
      device: 0,
      card_details: '',
      card_name: '',
      expiry_date: this.PropertyInfo.CurrentDate,
      card_cvv: '',
      // client_scheduling: false,
      customField1: '',
      customField2: '',
      customField3: '',
      customField4: '',
      customField5: '',
      comments: '',
      socialMedia: '',
      alergy: '',
      clientCreditCardInfo : []
    });
  }

  ngOnInit() {    
    if(this.parentForm){
      this.parentForm.addControl('additionalDetailsFormGroup', this.FormGrp);
    }
    if (this.isClientViewOnly) {
      this.utils.disableControls(this.FormGrp);
    }
  }  

  ngOnDestroy() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
    if (this.clientWindowConvertion) {
      this.clientWindowConvertion.unsubscribe();
    }
    this.isFirstTime = true;
  }

  async SetEditValues(clientInfo) {
    this.FormGrp.controls.comments.setValue(clientInfo.client.comments && clientInfo.client.comments !=null ? clientInfo.client.comments : '');
    this.FormGrp.controls.clientCreditCardInfo.setValue(clientInfo.client.clientCreditCardInfo && clientInfo.client.clientCreditCardInfo != null ? clientInfo.client.clientCreditCardInfo : []);
    this.cardInfo = clientInfo.client.clientCreditCardInfo && clientInfo.client.clientCreditCardInfo != null ? clientInfo.client.clientCreditCardInfo : [];
      if (this.cardInfo && this.cardInfo.length > 0) {
        const activeCard = this.cardInfo.filter(x => x.isActive);
        if (activeCard && activeCard.length > 0) {
          this.PaymentReferenceID = activeCard[0].tokenTransId;
          // let newCardInfo: CardInfo = await this.getCardInfo(activeCard[0].tokenTransId)
          // if (newCardInfo !== null) {
          //   this.displayCardInfo = newCardInfo;
          //   this.displayCardInfo.cardNumber = this.payAgentService.MaskCreditCardNumber(newCardInfo.cardNumber);
          // }
        }
      }
  }

  SaveReferenceId(event: number) {
    this.FormGrp.controls.device.markAsDirty();
    this.FormGrp.controls.device.markAsTouched();
    this.PaymentReferenceID = event;
    const swipedcardInfo = {
      id: 0,
      tokenTransId: event,
      isActive: true,
      clientId: 0,
      createdTime: this.PropertyInfo.CurrentDTTM
    };
    if (this.cardInfo) {
      this.cardInfo.forEach(x => { x.isActive = false; }); // deactive previously stored card info
      this.cardInfo = this.cardInfo.filter(c => c.id !== 0); // Remove previously swiped card info
    }
    
    this.cardInfo.push(swipedcardInfo);
    this.FormGrp.controls.clientCreditCardInfo.setValue(this.cardInfo);
  }

  fetchCustomFieldInfo() {
    this.http.CallApiWithCallback<any>({
      host: Host.spaManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetCustomFieldsWithValues",
      method: HttpMethod.Get,
      showError: false,
      extraParams: []
    });
  }

  getAllPriceTypes() {
    this.http.CallApiWithCallback<any>({
      host: Host.spaManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetAllPriceTypes",
      method: HttpMethod.Get,
      showError: false,
      extraParams: []
    });
  }

  makeGetCall(routeURL: string) {
    this.http.CallApiWithCallback<any[]>({
      host: Host.spaManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: routeURL,
      uriParams: { module: Module.client },
      method: HttpMethod.Get,
      showError: false,
      extraParams: ["dataBelongTo"]
    });
  }

  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == "GetCustomFieldsWithValues") {

      this.customFieldInfo = result.result ? result.result : [];
      if (this.customFieldInfo && this.customFieldInfo.length > 0) {
        for (let i = 0; i < this.customFieldInfo.length; i++) {
          //Display On 0 - Not displayed
          //Display On 1 - On client only
          //Display On 2 - On appointment only
          //Display On 3 - Both on client and on appointment
          if (this.customFieldInfo[i] && (this.customFieldInfo[i].displayOn == 1 || this.customFieldInfo[i].displayOn == 3)) {
            this.customFieldHidden[i] = false;
            this.customFieldDesc[i] = this.customFieldInfo[i].fieldName ? this.customFieldInfo[i].fieldName : '';
            if (i < 3) {
              this.customFieldValues[i] = this.customFieldInfo[i].customFieldValues && this.customFieldInfo[i].customFieldValues.length > 0 ? this.customFieldInfo[i].customFieldValues : [];
            }
          }
          if (this.isTitleHidden == true && this.customFieldHidden[i] == false) {
            this.isTitleHidden = false;
          }
        }
      }
      this.Validation(this.clientConfiguration);
      //this.SetEditValues();
    }
    if (callDesc == "GetClientConfiguration") {
      //this.clientConfiguration = <any>result.result;
      //this.fetchCustomFieldInfo();
    }
  }

  errorCallback<T>(): void {
  }

  Validation(clientConfiguration: any) {
    this.FormGrp.controls['customField1'].clearValidators()
    this.FormGrp.controls['customField1'].setValidators(clientConfiguration[0]["CUSTOM_FIELD_1"] && !this.customFieldHidden[0] ? [Validators.required] : []);
    this.FormGrp.controls['customField1'].updateValueAndValidity();
    this.FormGrp.controls['customField2'].clearValidators()
    this.FormGrp.controls['customField2'].setValidators(clientConfiguration[0]["CUSTOM_FIELD_2"] && !this.customFieldHidden[1] ? [Validators.required] : []);
    this.FormGrp.controls['customField2'].updateValueAndValidity();
    this.FormGrp.controls['customField3'].clearValidators()
    this.FormGrp.controls['customField3'].setValidators(clientConfiguration[0]["CUSTOM_FIELD_3"] && !this.customFieldHidden[2] ? [Validators.required] : []);
    this.FormGrp.controls['customField3'].updateValueAndValidity();
    this.FormGrp.controls['customField4'].clearValidators()
    this.FormGrp.controls['customField4'].setValidators(clientConfiguration[0]["CUSTOM_FIELD_4"] && !this.customFieldHidden[3] ? [Validators.required] : []);
    this.FormGrp.controls['customField4'].updateValueAndValidity();
    this.FormGrp.controls['customField5'].clearValidators()
    this.FormGrp.controls['customField5'].setValidators(clientConfiguration[0]["CUSTOM_FIELD_5"] && !this.customFieldHidden[4] ? [Validators.required] : []);
    this.FormGrp.controls['customField5'].updateValueAndValidity();

  }  
  consentManagement(){
    this.dialog.open(ConsentManagementComponent, {
      width: '80%',
      height: '80%',
      disableClose: true,
      data: {
        // guestId: this.createGuestBusiness.guestguid,
        // policyValue: value,
        // isPatch: this.isEdit
      },
    }).afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(res => {
      // action.enableCheck=false
    });
    }
  exportSend(){
    this.dialog.open(ExportSendComponent, {
      width: '36%',
      height: '65%',
      disableClose: true,
      data: {
      }
    });
 }
 retentionManagement(){
  this.dialog.open(DataRetentionComponent, {
    width: '30%',
    height: '50%',
    disableClose: true,
    data: {
      // guestguid: this.createGuestBusiness.guestguid,
      // guestId: this.createGuestBusiness.guestId.guestId,
      // dataGroups: value
    }
  }).afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(res => {
    
  });
  }
}

