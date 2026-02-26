import { Component, OnInit, OnDestroy, Input, ViewEncapsulation, Optional } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PropertyInformation } from '../../../../core/services/property-information.service';
import { ClientPopupComponent } from '../../client-popup.component';
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
import { takeUntil } from 'rxjs/operators';
import { GuestPolicyWrapperComponent } from './guest-policy-wrapper/guest-policy-wrapper.component';
import { GuestPolicyDetail, PolicyCategoryType, PolicyType } from 'src/app/common/shared/shared.modal';
import { ApplyPolicy } from 'src/app/common/consent-management/consent-management.model';
import { RetailRoutes } from 'src/app/retail/retail-route';
import * as GlobalConst from 'src/app/common/shared/shared/globalsContant';
import { PhilippinesMiscellaneousData, GuestTypeCategory } from 'src/app/common/shared/shared/business/shared.modals';
import { TokenSharingCallbackRequestInfo } from 'src/app/retail/shared/business/shared.modals';
import { FiscalFeatureConfigToggles } from 'src/app/common/constants/fiscal.constants';

@Component({
  standalone: false,
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
  actionType: string;
  vipTypes: any;
  guestTypes: any;
  isCopyClient = false;
  languages: any[] = [];
  maxDate: any;
  placeHolderFormat: any;
  guestId: string; // For edit flow - pass existing guest ID to capture-card component
  @Input() IsGDPREnabled : boolean = false;
  @Input() policyType : number = 0;
  get showGuestTypeInfo(): boolean {
    const fiscalFeatures = this.PropertyInfo.GetFiscalFunctionalities();
    return fiscalFeatures && fiscalFeatures[FiscalFeatureConfigToggles.GUEST_TYPE] === true;
  }
  
  guestTypeCategories: GuestTypeCategory[] = [];
  captionsCommon: any;
  @Input('inputData')
  set formData(value) {
    if(value && value.data!='')
    {
      this.additionalInfo = value.data;
      this.actionType = value.mode;
      this.isCopyClient = value.isCopyClient;
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
    private userMachineConfigurationService: UserMachineConfigurationService,
    @Optional() private clientPopupComponent: ClientPopupComponent
    ) {
    this.captions = this.localization.captions.bookAppointment;
    this.captionsCommon = this.localization.captions;
    this.floatLabel = this.localization.setFloatLabel;
    this.maxDate = this.PropertyInfo.CurrentDate;
    this.placeHolderFormat = this.localization.inputDateFormat;

    this.FormGrp = this.Form.group({
      // pricetype: 0,
      device: 0,
      card_details: '',
      card_name: '',
      expiry_date: this.PropertyInfo.CurrentDate,
      card_cvv: '',
      vip:'',
      vipTypeId: 0,
      guestType:'',
      // client_scheduling: false,
      customField1: '',
      customField2: '',
      customField3: '',
      customField4: '',
      customField5: '',
      comments: '',
      socialMedia: '',
      alergy: '',
      clientCreditCardInfo : [],
      consentDate :'',
      consentExpiryDate: '',
      consentPolicyId : '',
      isPurged: false,
      platformCommentUuid: '00000000-0000-0000-0000-000000000000',
      platformRevisionUuid: '00000000-0000-0000-0000-000000000000',
      commentId : 0,
      anniversaryDate : '',
      preferredLanguage: 0,
      guestTypeCategories: [],
      placeOfBirth: ''
    });
  }

   ngOnInit() {
    if(this.parentForm){
      this.parentForm.addControl('additionalDetailsFormGroup', this.FormGrp);
    }
    if (this.isClientViewOnly) {
      this.utils.disableControls(this.FormGrp);
    }
    this.getAllVipTypes();
    this.getAllGuestTypes();
    this.GetServiceCall('GetAllLanguages');
    this.FormGrp.get('vip')?.valueChanges.subscribe((selectedVip: string) => {
      const selectedVipType = this.vipTypes.find((type) => type.code === selectedVip);
      if (selectedVipType) {
        this.FormGrp.get('vipTypeId')?.setValue(selectedVipType.id); 
      } else {
        this.FormGrp.get('vipTypeId')?.setValue(0); 
      }
    });
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
    // Set guestId for edit flow - to be passed to capture-card component
    this.guestId = clientInfo.guestId;
    
    if(clientInfo.clientComment.length >0) {
      let clientComment = clientInfo.clientComment[0];
      this.FormGrp.controls.comments.setValue(clientComment.comments);
      this.FormGrp.controls.platformCommentUuid.setValue(clientComment.platformCommentUuid);
      this.FormGrp.controls.platformRevisionUuid.setValue(clientComment.platformRevisionUuid);
      this.FormGrp.controls.commentId.setValue(clientComment.id);
    } else{
      this.FormGrp.controls.comments.setValue(clientInfo.client.comments && clientInfo.client.comments !=null ? clientInfo.client.comments : '');
    }
    this.FormGrp.controls.anniversaryDate.setValue(clientInfo.client.anniversaryDate 
        ? this.utils.getDate(clientInfo.client.anniversaryDate) : ''
    );
    this.FormGrp.controls.preferredLanguage.setValue(Number(clientInfo.client.preferredLanguage));
    this.cardInfo = this.isCopyClient ? [] : clientInfo.client.clientCreditCardInfo && clientInfo.client.clientCreditCardInfo != null ? clientInfo.client.clientCreditCardInfo : [];
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
    this.FormGrp.controls.clientCreditCardInfo.setValue(this.cardInfo);
    this.FormGrp.controls.vip.setValue(clientInfo.client.vip);
    this.FormGrp.controls.vipTypeId.setValue(clientInfo.client.vipTypeId);
    this.FormGrp.controls.guestType.setValue(clientInfo.client.guestType);
    
    if (clientInfo.guestTypeCategories && clientInfo.guestTypeCategories.length > 0) {
      this.guestTypeCategories = clientInfo.guestTypeCategories;
      this.FormGrp.get('guestTypeCategories')?.setValue(clientInfo.guestTypeCategories);
    } else {
      this.guestTypeCategories = [];
      this.FormGrp.get('guestTypeCategories')?.setValue([]);
    }
    this.FormGrp.controls.placeOfBirth.setValue(clientInfo.client.placeOfBirth || '');
  }

  async getAllVipTypes() {
    await this.http.CallApiAsync<any>({
      host: Host.retailPOS,
      callDesc: RetailRoutes.GetAllVipType,
      method: HttpMethod.Get,
      showError: false,
      uriParams: { isIncludeInactive: false },
    }).then(x =>
      this.vipTypes = x.result
    );
  }

  async getAllGuestTypes() {
    await this.http.CallApiAsync<any>({
      host: Host.retailPOS,
      callDesc: RetailRoutes.GetAllGuestTypes,
      method: HttpMethod.Get,
      showError: false,
      uriParams: { isIncludeInactive: false },
    }).then(x =>
      this.guestTypes = x.result
    );
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

  OnTokenStored(event: TokenSharingCallbackRequestInfo) {
    // Handle token stored event from capture-card component
    if (event && this.clientPopupComponent) {
      this.clientPopupComponent.setTokenStoredInfo(event);
    }
  }

  removeCardReference() {
    this.FormGrp.markAsDirty();
    this.FormGrp.markAsTouched();
    this.parentForm.updateValueAndValidity();
    this.PaymentReferenceID = 0;
    this.cardInfo.forEach(c => c.isActive = false);
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
    if (callDesc == 'GetAllLanguages') {
      if (result.result) {
        let data = <any>result.result;
        this.languages = data.map(x => { return { id: x.id, name: x.languageName, code: x.languageCode } });
      }
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
  openGuestPolicyDialog(popupType) {
    let guestPolicyDetail : GuestPolicyDetail;
    if(this.additionalInfo && this.additionalInfo.client)
    {
      guestPolicyDetail = {
        id: this.additionalInfo.guestId,
        consentDate : this.additionalInfo.client.consent,
        consentExpiryDate: this.additionalInfo.client.consentExpiryDate,
        consentPolicyId : this.additionalInfo.client.consentPolicyId,
        comments:"",
        isPurged:  this.additionalInfo.client.isPurged,
        policyCategoryType : PolicyCategoryType.Guest
      } 
    }
    else{
      guestPolicyDetail = {
        id: '',
        consentDate : this.FormGrp.value.consentDate,
        consentExpiryDate: this.FormGrp.value.consentExpiryDate,
        consentPolicyId : this.FormGrp.value.consentPolicyId,
        comments:"",
        isPurged:  this.FormGrp.value.isPurged,
        policyCategoryType : PolicyCategoryType.Guest
      } 
    }

    this.dialog.open(GuestPolicyWrapperComponent, {
      width: '80%',
      height: '80%',
      disableClose: true,
      data: {
        guestPolicyDetail : guestPolicyDetail,
        popupType: popupType
      },
    }).afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(res => {
      if(res != undefined && popupType == 1)
      {
        let guestPolicyDetail : ApplyPolicy = res as ApplyPolicy
        this.policyType = PolicyType.ConsentPolicy;
        this.FormGrp.controls.device.markAsDirty();
        this.FormGrp.controls.device.markAsTouched();
        this.FormGrp.controls.consentDate.setValue(guestPolicyDetail.consentDate != '' && guestPolicyDetail.consentDate ?  this.localization.getDate(guestPolicyDetail.consentDate):null);
        this.FormGrp.controls.consentExpiryDate.setValue(guestPolicyDetail.consentExpiryDate != '' && guestPolicyDetail.consentExpiryDate ? this.localization.getDate(guestPolicyDetail.consentExpiryDate) : null);
        this.FormGrp.controls.consentPolicyId.setValue(guestPolicyDetail.policyId);
        if(this.additionalInfo &&  this.additionalInfo.client){
          this.additionalInfo.client.consent = this.localization.getDate(guestPolicyDetail.consentDate);
          this.additionalInfo.client.consentExpiryDate = guestPolicyDetail.consentExpiryDate ? this.localization.getDate(guestPolicyDetail.consentExpiryDate) : null;
          this.additionalInfo.client.consentPolicyId = guestPolicyDetail.policyId;
          return;
        }
      }
      else if(res != undefined && popupType == 2 )
      {
        this.additionalInfo.client.isPurged = res ?  true : false;
      }
    });
  }

  GetServiceCall(Route, Uri?) {
      this.http.CallApiWithCallback<any>({
        host: GlobalConst.Host.authentication,
        success: this.successCallback.bind(this),
        error: this.errorCallback.bind(this),
        callDesc: Route,
        uriParams: Uri,
        method: HttpMethod.Get,
        showError: true,
        extraParams: []
      });
    }

    onGuestTypeMiscDataChange(data: PhilippinesMiscellaneousData) {
    this.guestTypeCategories = data.guestTypeCategories || [];
    this.FormGrp.get('guestTypeCategories')?.setValue(this.guestTypeCategories);
    this.FormGrp.markAsDirty();
    this.FormGrp.markAsTouched();
  }


}
