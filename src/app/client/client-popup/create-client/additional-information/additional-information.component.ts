import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PropertyInformation } from '../../../../core/services/property-information.service';
import { SubscriptionLike as ISubscription, Subscription } from 'rxjs';
import { HandleRequest, HandleResponse } from '../../../../shared/shared-models';
import { MatDialogRef, MatDialog } from '@angular/material';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { IDTechCardSwipeTimeout, Module, Host } from 'src/app/common/shared/shared/globalsContant';
import { Localization } from 'src/app/common/shared/localization/Localization';
import { Utilities } from 'src/app/common/shared/shared/utilities/utilities';
import { PayAgentService } from 'src/app/common/shared/shared/service/payagent.service';
import { UserSessionConfiguration } from 'src/app/common/shared/retail.modals';
import { UserMachineConfigurationService } from 'src/app/retail/common/services/user-machine-configuration.service';
import { BaseResponse, Device, PaymentMethods, TokentransactionInfo, ClientCreditCardInfo, CardInfo, 
  PaymentBaseResponse, StoreTokenRequest, IDTech, IDTechHandle } from 'src/app/common/shared/shared/business/shared.modals';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
  providers:[UserMachineConfigurationService],
  encapsulation:ViewEncapsulation.None
})
export class AdditionalInformationComponent implements OnInit, OnDestroy {
  @Input() parentForm: FormGroup;
  cardConnectDialog: MatDialogRef<any, any>;

  additionalDetails: any = [];
  FormGrp: FormGroup;
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
  displayCardInfo: CardInfo;
  formSubscription: ISubscription;
  selectedDevice: string;
  availableDevices: Device[] = [];
  cardType = 'visa';
  EncryptedCardData: string = '';
  userSessionConfiguration: UserSessionConfiguration;
  IDTechCardSwipePopupClosed: boolean = false;
  clientWindowConvertion: Subscription;
  isFirstTime: boolean = true;
  isClientViewOnly = false;
  additionalInfo :any;
  @Input('inputData')
  set formData(value) {
    if(value)
    {
      this.additionalInfo = value;
    }
  }
  constructor(private Form: FormBuilder, private http: HttpServiceCall,
    public localization: Localization, public dialog: MatDialog, private utils: Utilities, private PropertyInfo: PropertyInformation,
    private payAgentService: PayAgentService, private userMachineConfigurationService: UserMachineConfigurationService) {
    this.captions = this.localization.captions.bookAppointment;
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
      alergy: ''
    });
  }

  ngOnInit() {
    this.initializeFormData();
    if(this.parentForm){
      this.parentForm.addControl('additionalDetailsFormGroup', this.FormGrp);
    }
  }

  initializeFormData() {
    this.selectedDevice = this.FormGrp.controls.device.value;
    this.makeGetCall("GetClientConfiguration");
    this.getDevices();
  }

  async getDevices() {
    let result = [];
    let RequestBody: HandleRequest;
    if (this.selectedDevice == IDTechHandle.name) {
      RequestBody = {
        tenderId: PaymentMethods.IDTECH.toString(),
        inquiryInfo: {
          cardData: {
            encryptedData: JSON.stringify({
              deviceType: 'idtechkb',
              encryptedData: this.EncryptedCardData
            })
          }
        }
      }
    } else {
      RequestBody = {
        tenderId: PaymentMethods.CreditCard.toString()
      };
    }
    let userSessionConfiguration: UserSessionConfiguration = await this.userMachineConfigurationService.getUserSessionConfiguration(Number(this.localization.GetPropertyInfo('UserId')));
    if ((userSessionConfiguration.isIdtechSred || userSessionConfiguration.defaultPaymentDevice == IDTech.id) && !this.availableDevices.includes(IDTechHandle)) {
      this.availableDevices.push(IDTechHandle);
    }
    const Handles: Promise<HandleResponse> = this.payAgentService.GetHandles(RequestBody);
    Handles.then(response => {
      if (response && response.status.toLocaleLowerCase() === 'success' && response.paymentHandle.length > 0) {
        if (this.selectedDevice == IDTechHandle.name && this.EncryptedCardData) {
          this.CreateToken(response.paymentHandle[0].handle, PaymentMethods.IDTECH);
        } else {
          let availableIngenicoDevices = response.paymentHandle;
          availableIngenicoDevices.map(device => {
            if (this.availableDevices.filter(x => x.name == device.name).length == 0) {
              this.availableDevices.unshift(device);
            }
          });
        }
      }
      this.SelectDefaultDevice(userSessionConfiguration);
    });
  }

  SelectDefaultDevice(userSessionConfiguration) {
    if (userSessionConfiguration && userSessionConfiguration.defaultPaymentDevice.toLowerCase() == IDTech.id) {
      this.FormGrp.controls.device.patchValue(IDTechHandle.handle);
      this.ondeviceChange(IDTechHandle);
    } else {
      let defaultDevice = this.availableDevices.find(x => x.name == userSessionConfiguration.defaultDeviceName);
      if (defaultDevice) {
        this.FormGrp.controls.device.patchValue(defaultDevice.handle);
        this.ondeviceChange(defaultDevice);
      }
    }
  }


  CloseRoomOpenDialog(data: any): void {
    this.IDTechCardSwipePopupClosed = true;
    if (data && this.selectedDevice == IDTechHandle.name) {
      this.EncryptedCardData = data;
      this.getDevices();
    }
  }

  RoomOpenDialog() {
    const Popupmessage = this.localization.captions.shop.SwipeCardMessage;
    const isIDTech: boolean = (this.selectedDevice == IDTechHandle.name);
    const dataObj = { 'text': Popupmessage, 'buttonname': isIDTech ? this.localization.captions.common.Close : '', 'headertext': '', 'isloaderenable': true, 'isHiddenFieldRequired': isIDTech };
    this.cardConnectDialog = this.utils.roomOpenDialog(dataObj, this.CloseRoomOpenDialog.bind(this));
  }



  async connectDeviceAndGetCardInfo() {
    let handle: string = "";
    if (this.selectedDevice != IDTechHandle.name) {
      this.RoomOpenDialog();
      handle = this.FormGrp.controls.device.value;
      this.CreateToken(handle, PaymentMethods.CreditCard);
    } else {
      this.CaptureCardWithIDTechDevice();
    }
  }

  CreateToken(handle, tenderID) {
    // Lights up the connected Device and asks for the card swipe
    const tokentransactionInfo: Promise<TokentransactionInfo> = this.payAgentService.CreateToken(handle, tenderID);
    tokentransactionInfo.then(response => {
      if (response.status.toLocaleLowerCase() === 'success') {
        this.SetSwippedCardInfo(response, tenderID);
      }
    }).catch(err => {
      if (err.error[0] != null && err.error[0].Code != null) {
        this.payAgentService.PaymentErrorPrompt(err.error[0].Code);
      }
      else {
        return this.utils.ShowError(this.localization.captions.common.Error, this.localization.captions.shop.PMUnexpectedError);
      }
      this.cardConnectDialog.close();
    });
  }

  async SetSwippedCardInfo(tokentransactionInfo: TokentransactionInfo, tenderID: number) {
    let swipedcardInfo: ClientCreditCardInfo;
    let newCardInfo: CardInfo;
    newCardInfo = {
      cardNumber: tokentransactionInfo.account.id,
      cardHolderName: tokentransactionInfo.account.name,
      entryMode: tokentransactionInfo.cardInfo.entryMode,
      issuerType: tokentransactionInfo.cardInfo.issuer.toLowerCase(),
      cardExpiration: tokentransactionInfo.cardInfo.cardExpiration,
      cardType: tokentransactionInfo.cardInfo.cardType
    }

    if (!this.payAgentService.ValidateCreditCard(newCardInfo)) {
      this.cardConnectDialog.close();
      return;
    }

    let storeTokenReq: StoreTokenRequest =
    {
      cardInfo: newCardInfo,
      payAgentResponse: {
        account: tokentransactionInfo.account,
        payAgentId: tokentransactionInfo.payAgentId,
        status: tokentransactionInfo.status,
        transactionDetails: tokentransactionInfo.transactionDetails,
        transactionKey: tokentransactionInfo.transactionKey,
      },
      tenderId: tenderID
    }
    let baseResponse: PaymentBaseResponse = await this.getToken(storeTokenReq);
    if (baseResponse && baseResponse !== null) {
      swipedcardInfo = {
        id: 0,
        tokenTransId: baseResponse.transactionId,
        isActive: true,
        clientId: 0,
        createdTime: this.PropertyInfo.CurrentDTTM
      };
      this.cardConnectDialog.close();
      this.FormGrp.controls.device.markAsDirty();
      this.FormGrp.controls.device.markAsTouched();
    } else {
      // throw error
      this.cardConnectDialog.close();
      return;
    }

    if (this.cardInfo) {
      this.cardInfo.forEach(x => { x.isActive = false; }); // deactive previously stored card info
      this.cardInfo = this.cardInfo.filter(c => c.id !== 0); // Remove previously swiped card info
    }
    this.cardInfo.push(swipedcardInfo);
    this.displayCardInfo = newCardInfo;
    this.displayCardInfo.cardNumber = this.payAgentService.MaskCreditCardNumber(newCardInfo.cardNumber);
  }

  formatCreditCardExpiryDate(date: string): string {
    return this.payAgentService.formatCreditCardExpiryDate(date);
  }

  async getToken(storeTokenRequest: StoreTokenRequest): Promise<PaymentBaseResponse> {
    const baseResponse: PaymentBaseResponse = await this.payAgentService.StoreToken(storeTokenRequest);
    return baseResponse;
  }

  async getCardInfo(tokenRefId: number): Promise<CardInfo> {
    return await this.payAgentService.GetCardInfo(tokenRefId);
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

  SetEditValues() {

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
      this.SetEditValues();
    }
    if (callDesc == "GetClientConfiguration") {
      this.clientConfiguration = <any>result.result;
      this.fetchCustomFieldInfo();
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

  ondeviceChange(device) {
    this.selectedDevice = this.FormGrp.controls.device.value;
  }

  CaptureCardWithIDTechDevice() {
    this.IDTechCardSwipePopupClosed = false;
    this.RoomOpenDialog();
    setTimeout(() => {
      if (!this.EncryptedCardData && !this.IDTechCardSwipePopupClosed) {
        this.cardConnectDialog.close();
        this.utils.ShowError(this.localization.captions.common.Error, this.utils.getError(10725));
      }
    }, IDTechCardSwipeTimeout);
  }
}

