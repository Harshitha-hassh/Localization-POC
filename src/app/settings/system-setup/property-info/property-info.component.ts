import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, Validators } from '@angular/forms';
import { ComboOptions, SystemConfiguration } from 'src/app/common/shared/shared/business/view-settings.modals';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { SystemSetupBusinessService } from '../system-setup.business.service';
import { SystemConfig, PropertyConfig, PhNumber, BaseResponse, DefaultFieldConfigurationSwitches } from 'src/app/common/shared/shared/business/shared.modals';
import { Observable, ReplaySubject, SubscriptionLike as ISubscription } from 'rxjs';
import { SettingsService } from '../../settings.service';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { SpaFormAgent } from 'src/app/common/shared/shared/spa-form';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { defaultThemeColorSwitch } from 'src/app/shared/enums/constants';
import { colorPickerModifier } from 'src/app/common/pipes/colorPickerModifier.pipe';
import { PhoneTypes } from 'src/app/common/enums/shared-enums';
import { GuestProfileMailTypes } from 'src/app/common/shared/shared/enums/enums';

@Component({
  standalone: false,
  selector: 'app-property-info',
  templateUrl: './property-info.component.html',
  styleUrls: ['./property-info.component.scss'],
  providers: [SystemSetupBusinessService,colorPickerModifier],
  encapsulation: ViewEncapsulation.None
})
export class PropertyInfoComponent extends SpaFormAgent implements OnInit, OnDestroy {
  propertyInformation;
  settingInfo: SystemConfiguration[] = [];
  propertyInfo: UntypedFormGroup;
  contactPhoneType: ComboOptions[];
  contactPhoneLabelType: any;
  contactEmailType: any;
  RequiredFieldInfo: any;
  languageType: any[];
  textmaskFormat: string;
  phone: UntypedFormArray;
  address: UntypedFormArray;
  requiredFields: UntypedFormArray;
  addresslength = 0;
  captions: any;
  requiredFieldsInfo: any;
  enableSave: boolean;
  CUSTOM_FIELD_1: any;
  CUSTOM_FIELD_2: any;
  CUSTOM_FIELD_3: any;
  CUSTOM_FIELD_4: any;
  CUSTOM_FIELD_5: any;
  isUserAuthorized = true;
  isViewOnly = false;
  propertyInfoSubscription: ISubscription;
  initialLoads = true;
  callCounter = 0;
  skipPhoneNumberValidationonBlur = true;
  commonCaptions: any;
  propertyConfigurationDetails: any;
  PhoneType: { id: number; description: any; }[];
  filteredCountries: Observable<any>;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  floatLabel: string;
  phoneTypes = PhoneTypes;
  mailTypes = GuestProfileMailTypes;
  constructor(private BP: BreakPointAccess,
    private systemConfig: SystemSetupBusinessService,
    private fb: UntypedFormBuilder,
    private localization: RetailStandaloneLocalization,
    private utilities: RetailUtilities,
    public http: HttpServiceCall,
    private utils: RetailUtilities,
    private ss: SettingsService,
    private colorPickerModifier: colorPickerModifier) {
    super(http);
    this.ss.tabLoaderEnable.next(true);
    this.commonCaptions = this.localization.captions.common;
    this.floatLabel = this.localization.setFloatLabel;
    this.propertyConfigurationDetails = {
      name: '',
      address: [{ addressDetails: '' }, { addressDetails: '' }],
      postalcode: '',
      state: '',
      city: '',
      country: '',
      phone: [{
        phonetype: 'Phone',
        phonelabel: this.commonCaptions.drp_txt_home,
        phonenumber: ''
      }, { phonetype: 'Phone', phonelabel: this.commonCaptions.drp_txt_office, phonenumber: '' },
      { phonetype: 'Phone', phonelabel: this.commonCaptions.drp_txt_mobile, phonenumber: '' }],
      language: '',
      tenantId: '',
      propCode: '',
      requiredFields: [],
      DEFAULT_EMAIL_TYPE: '',
      DEFAULT_COUNTRY_CODE: ['', Validators.min(1)],
      DEFAULT_PHONE_TYPE: '',
      THEME_COLOR: '',
    };

    this.PhoneType = [
      { 'id': 1, 'description': this.commonCaptions.drp_txt_home },
      { 'id': 2, 'description': this.commonCaptions.drp_txt_office },
      { 'id': 3, 'description': this.commonCaptions.drp_txt_mobile }
    ];
  }

  ngOnInit() {
    this.propertyInfo = this.fb.group({
      name: '',
      address: this.fb.array([]),
      postalcode: '',
      state: '',
      city: '',
      country: '',
      phone: this.fb.array([]),
      language: '',
      tenantId: ['', Validators.required],
      propCode: ['', Validators.required],
      requiredFields: this.fb.array([]),
      DEFAULT_EMAIL_TYPE: '',
      DEFAULT_COUNTRY_CODE: ['', Validators.min(1)],
      DEFAULT_PHONE_TYPE: '',
      THEME_COLOR: ''
    });
    this.phone = this.propertyInfo.get('phone') as UntypedFormArray;

    this.contactPhoneLabelType = [
      {
        "id": this.phoneTypes.mobile,
        "description": this.localization.captions.common.drp_txt_mobile
      },
      {
        "id": this.phoneTypes.home,
        "description": this.localization.captions.common.drp_txt_home
      },
      {
        "id": this.phoneTypes.office,
        "description": this.localization.captions.common.drp_txt_office
      },
      {
        "id": this.phoneTypes.business,
        "description": this.localization.captions.common.drp_txt_business
      },
      {
        "id": this.phoneTypes.work,
        "description": this.localization.captions.common.drp_txt_work
      }
    ];

    this.contactEmailType = [
      {
        "id": this.mailTypes.personal,
        "description": this.localization.captions.common.drp_txt_personal
      },
      {
        "id": this.mailTypes.office,
        "description": this.localization.captions.common.drp_txt_office
      },
      {
        "id": this.mailTypes.home,
        "description": this.localization.captions.common.drp_txt_home
      },
      {
        "id": this.mailTypes.business,
        "description": this.localization.captions.common.drp_txt_business
      }
    ];

    this.contactPhoneType = [{ Id: 1, Description: this.commonCaptions.drp_txt_cell, Type: 'Phone' },
    { Id: 2, Description: this.commonCaptions.drp_txt_home, Type: 'Phone' },
    { Id: 3, Description: this.commonCaptions.drp_txt_office, Type: 'Phone' },
    { Id: 12, Description: this.commonCaptions.drp_txt_business, Type: 'Phone' },
    { Id: 13, Description: this.commonCaptions.drp_txt_work, Type: 'Phone' }];
    this.languageType = [{ id: 1, value: 'English', code: 'en-US' },
    { id: 2, value: 'Spanish', code: 'SPANISH' }, { id: 3, value: 'Chinese', code: 'Chinese' }];
    this.textmaskFormat = this.localization.propertyCaptions.common && this.localization.propertyCaptions.common.PhoneFormat != '' ?
      this.localization.propertyCaptions.common.PhoneFormat : '999999999999999999';
    this.address = this.propertyInfo.get('address') as UntypedFormArray;
    this.addresslength = this.address.length;
    this.captions = this.localization.captions.setting;
    this.GetServiceCall('GetAllLanguages');
    // this.ValidateBreakPoint();
    this.RequiredFieldsSetting();
    this.RequiredfieldsBind();
    this.utilities.geCountriesJSON().then(res => {
      this.filteredCountries = this.propertyInfo.controls.country.valueChanges.pipe(
        startWith(''),
        debounceTime(100),
        distinctUntilChanged(),
        map((country: string) => country ? this.utilities.FilterCountry(country, this.utilities.countryDetails) : [])
      );
      this.propertyInfo.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(res => {
        if (this.propertyInfo.controls['city'].value) {
          this.propertyInfo.controls.country.setErrors({ required: true });
        } else {
          this.propertyInfo.controls.country.setErrors(null);
        }
        if (this.propertyInfo.controls['country'].value &&
          !this.utilities.FilterCountryValueFromData(this.propertyInfo.controls['country'].value)) {
          this.propertyInfo.controls.country.setErrors({ invalid: true });
        } else if ((this.propertyInfo.controls['city'].value &&
          this.utilities.FilterCountryValueFromData(this.propertyInfo.controls['country'].value) &&
          this.propertyInfo.controls['country'].value) || (!this.propertyInfo.controls['city'].value &&
            !this.propertyInfo.controls['country'].value)) {
          this.propertyInfo.controls.country.setErrors(null);
        }
        this.propertyInfo.controls['country'].markAsTouched();
      });
    });
  }

  ValidateBreakPoint(): void {
    this.isUserAuthorized = true //this.BP.CheckForAccess([GlobalConst.SPAScheduleBreakPoint.SettingSystemSettings]);
    this.isViewOnly = false //this.BP.IsViewOnly(GlobalConst.SPAScheduleBreakPoint.SettingSystemSettings);
    if (this.isViewOnly) {
      this.utilities.disableControls(this.propertyInfo);
    }
  }

  ngOnDestroy() {
    if (this.propertyInfoSubscription) {
      this.propertyInfoSubscription.unsubscribe();
    }
    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }
  }

  RequiredFieldsSetting() {
    let _propJSON: any = {};
    this.settingInfo.map(sc => {
      // if (sc.switchType == "Boolean") {
      //   sc.value = this.convertStringToBoolean(sc.value as string);
      // }
      _propJSON[sc.switch] = sc.value
      _propJSON[sc.id] = sc.id
    });
    this.systemConfig.systemConfigValues = _propJSON;
    this.formAndPatchRequiredFieldsData(_propJSON);
    this.enableSave = false;
  }

  RequiredfieldsBind() {
    const personalInfo = [
      { id: 1, name: this.captions.Title, controlName: "CLIENT_TITLE" },
      // { id: 2, name: this.captions.First_Name, controlName: "CLIENT_FIRST_NAME" },
      // { id: 3, name: this.captions.Last_Name, controlName: "CLIENT_LAST_NAME" },
      { id: 4, name: this.captions.Birthday, controlName: "CLIENT_BIRTHDAY" },
      { id: 5, name: this.captions.Gender, controlName: "CLIENT_GENDER" },
      { id: 90, name: this.captions.Nationality, controlName: "CLIENT_NATIONALITY" },
    ];
    const contactInfo = [
      { id: 1, name: this.captions.Address, controlName: "CLIENT_ADDRESS_LINE_1" },
      { id: 2, name: this.captions.City, controlName: "CLIENT_CITY" },
      { id: 3, name: this.captions.State, controlName: "CLIENT_STATE" },
      { id: 4, name: this.captions.Postal_Code, controlName: "CLIENT_POSTAL_CODE" },
      { id: 5, name: this.captions.Country, controlName: "CLIENT_COUNTRY" },
      { id: 6, name: this.captions.Phone, controlName: "CLIENT_PHONE" },
      { id: 7, name: this.captions.Email, controlName: "CLIENT_EMAIL" },
    ];
    // const paymentInfo = [
    //   { id: 1, name: this.captions.Credit_Card, controlName: "CLIENT_CREDIT_CARD" },
    // ]
    this.requiredFieldsInfo = [
      {
        name: this.captions.personalInformation,
        requiredInfo: personalInfo
      },
      {
        name: this.captions.contactDetails,
        requiredInfo: contactInfo
      },
      // {
      //   name: this.captions.paymentDetails,
      //   requiredInfo: paymentInfo
      // }
    ];
    //this.ValidateBreakPoint();
    this.GetPropertyInfo();
    this.GetAllSetting();
    this.requiredFields = this.propertyInfo.get('requiredFields') as UntypedFormArray;
    for (let i = 0; i < this.requiredFieldsInfo.length; i++) {
      switch (this.requiredFieldsInfo[i].name) {
        case this.captions.personalInformation:
          this.requiredFields.push(this.addPersonalDetails());
          break;
        case this.captions.contactDetails:
          this.requiredFields.push(this.addContactDetails());
          break;
        case this.captions.paymentDetails:
          this.requiredFields.push(this.addPaymentDetails());
          break;
      }
    }
    this.propertyInfo.patchValue(this.propertyConfigurationDetails);
    this.propertyInfoSubscription = this.propertyInfo.valueChanges.subscribe(() => {
      this.enableSave = true;
    });

  }

  GetAllSetting() {
    this.http.CallApiWithCallback<any>({
      host: Host.retailManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetSettingByModule",
      uriParams: { module: "Client" },
      method: HttpMethod.Get,
      showError: false,
      extraParams: [{ Id: this.utils.GetPropertyInfo('PropertyId') }]
    });
    this.setClientDefaultSwitches();
  }
  setClientDefaultSwitches() {
    //Set Default Configuration Switches
    if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch)) {
      const defaultEmailType = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch);
      this.propertyInfo.controls.DEFAULT_EMAIL_TYPE.setValue(defaultEmailType && Number(defaultEmailType.value) > 0 ? Number(defaultEmailType.value) : '');
    }
    if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch)) {
      const defaultPhoneType = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch);
      this.propertyInfo.controls.DEFAULT_PHONE_TYPE.setValue(defaultPhoneType && Number(defaultPhoneType.value) > 0 ? Number(defaultPhoneType.value) : '');
    }
    if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch)) {
      const defaultPhoneCode = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch);
      this.propertyInfo.controls.DEFAULT_COUNTRY_CODE.setValue(defaultPhoneCode && Number(defaultPhoneCode.value) > 0 ? Number(defaultPhoneCode.value) : '');
    }
  }
  GetPropertyInfo() {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetPropertyInfoByPropertyId',
      uriParams: { Id: this.utils.GetPropertyInfo('PropertyId') },
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }
  GetlanguageInfo() {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetLangugae',
      uriParams: { Id: this.utils.GetPropertyInfo('PropertyId') },
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  ngAfterViewInit() {
    // this.calculateHeight();
  }
  GetServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }
  calculateHeight() {
    try {
      const col1 = document.getElementById('required-0').offsetHeight;
      const col2 = document.getElementById('required-1').offsetHeight;
      const col3 = document.getElementById('required-2').offsetHeight;
      const maxHeight = Math.max(col1, col2, col3);
      this.setHeight(maxHeight);
    } catch (e) { }
  }

  setHeight(height) {
    try {
      document.getElementById('required-0').style.height = height + 'px';
      document.getElementById('required-1').style.height = height + 'px';
      document.getElementById('required-2').style.height = height + 'px';
    } catch (e) { }
  }

  addPersonalDetails(): UntypedFormGroup {
    return this.fb.group({
      CLIENT_TITLE: '',
      //  CLIENT_FIRST_NAME: '',
      //  CLIENT_LAST_NAME: '',
      CLIENT_BIRTHDAY: '',
      CLIENT_GENDER: '',
      CLIENT_NATIONALITY: ''
    });
  }

  addContactDetails(): UntypedFormGroup {
    return this.fb.group({
      CLIENT_ADDRESS_LINE_1: '',
      CLIENT_CITY: '',
      CLIENT_STATE: '',
      CLIENT_POSTAL_CODE: '',
      CLIENT_COUNTRY: '',
      CLIENT_PHONE: '',
      CLIENT_EMAIL: ''
    });
  }

  addPaymentDetails(): UntypedFormGroup {
    return this.fb.group({
      CLIENT_CREDIT_CARD: '',
      CUSTOM_FIELD_1: '',
      CUSTOM_FIELD_2: '',
      CUSTOM_FIELD_3: '',
      CUSTOM_FIELD_4: '',
      CUSTOM_FIELD_5: ''
    });
  }

  addPhoneDetails() {
    const phoneDetails = this.propertyConfigurationDetails.phone;
    const phoneInfo = [];
    for (let i = 0; i < phoneDetails.length; i++) {
      phoneInfo.push(this.fb.group({
        phonetype: 'Phone',
        phonelabel: phoneDetails[i].phonelabel,
        phonenumber: this.utilities.appendFormat(phoneDetails[i].phonenumber, this.localization.propertyCaptions.common.PhoneFormat)
      }));
    }
    return phoneInfo;
  }

  addPhoneArray(index, phoneLabel, phoneNumber): UntypedFormGroup {
    return this.fb.group({
      phonetype: 'Phone',
      phonelabel: phoneLabel,
      phonenumber: { value: this.utilities.appendFormat(phoneNumber, this.localization.propertyCaptions.common.PhoneFormat), disabled: !phoneLabel }
    });
  }
  addPhoneItem(index, phoneLabel: any, phoneNumber: any): void {
    this.phone = this.propertyInfo.get('phone') as UntypedFormArray;
    this.phone.insert(1, this.addPhoneArray(index, phoneLabel, phoneNumber));
  }

  removePhoneItem(index: number): void {
    this.phone = this.propertyInfo.get('phone') as UntypedFormArray;
    this.phone.removeAt(index);
  }

  addAddressArray(index, addressDetails): UntypedFormGroup {
    return this.fb.group({
      addressDetails: addressDetails
    });
  }

  addAddress(index: number, addressDetails: any) {
    this.address = this.propertyInfo.get('address') as UntypedFormArray;
    if (this.address.length < 3) {
      this.address.push(this.addAddressArray(index, addressDetails));
    }
    this.addresslength = this.address.length;
  }

  removeAddress(index: number) {
    this.address.removeAt(index);
    this.addresslength--;
  }

  save() {
    const bodySettingData: SystemConfig[] = this.formSettingBody();
    this.UpdateSetting(bodySettingData);
    const bodyPropertyData: PropertyConfig = this.formPropertyData();
    this.UpdatePropertySetting(bodyPropertyData);
    this.updateClientDefaultsInSession();
  }
  updateClientDefaultsInSession() {
    const sessionDefaultSettings = sessionStorage.getItem('defaultSettings');
    const parsedSessionDefaultSettings = JSON.parse(sessionDefaultSettings);

    //Set Default Configuration Switches
    if (parsedSessionDefaultSettings.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch)) {
      const defaultEmailType = this.propertyInfo.controls.DEFAULT_EMAIL_TYPE.value;
      parsedSessionDefaultSettings.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch).value = defaultEmailType;
    }
    if (parsedSessionDefaultSettings.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch)) {
      const defaultPhoneType = this.propertyInfo.controls.DEFAULT_PHONE_TYPE.value;
      parsedSessionDefaultSettings.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch).value = defaultPhoneType;
    }
    if (parsedSessionDefaultSettings.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch)) {
      const defaultPhoneCode = this.propertyInfo.controls.DEFAULT_COUNTRY_CODE.value;
      parsedSessionDefaultSettings.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch).value = defaultPhoneCode;
    }
    if (parsedSessionDefaultSettings.some(f => f.switch == defaultThemeColorSwitch)) {
      const defaultThemeColor = this.propertyInfo.controls.THEME_COLOR.value;
      parsedSessionDefaultSettings.find(f => f.switch == defaultThemeColorSwitch).value = defaultThemeColor;
    }
    sessionStorage.setItem('defaultSettings', JSON.stringify(parsedSessionDefaultSettings));
  }
  UpdatePropertySetting(bodyPropertyData) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'UpdatePropertyInfoByPropertyId',
      body: bodyPropertyData,
      method: HttpMethod.Post,
      showError: true,
      extraParams: []
    });
  }
  GetCustomFields() {
    this.http.CallApiWithCallback<any>({
      host: Host.spaManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetCustomFields',
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  UpdateSetting(bodyData) {
    this.http.CallApiWithCallback<any>({
      host: Host.retailManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'UpdateSetting',
      body: bodyData,
      method: HttpMethod.Put,
      showError: true,
      extraParams: []
    });
  }
  formSettingBody(): SystemConfig[] {
    const allControls = [this.requiredFields.controls];
    const con = allControls[0];
    let _body: SystemConfig[] = [];
    for (const systemControl of con) {
      const formControl = systemControl as UntypedFormGroup;
      const controls: string[] = Object.keys(formControl.controls);
      for (const control of controls) {
        const switchName = control;
        let _systemConfig: SystemConfig;
        _systemConfig = {
          id: this.settingInfo.find(setting => setting.switch == switchName).id,
          moduleId: this.settingInfo.find(s => s.switch == switchName).moduleId,
          switch: switchName,
          value: formControl.controls[control].value
        };
        _body.push(_systemConfig);
      }
    }

    //Default Configuration Switches
    _body.push({
      id: this.settingInfo.find(setting => setting.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch).id,
      moduleId: this.settingInfo.find(s => s.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch).moduleId,
      switch: DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch,
      value: this.propertyInfo.controls[DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch].value ? this.propertyInfo.controls[DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch].value : 0
    });
    _body.push({
      id: this.settingInfo.find(setting => setting.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch).id,
      moduleId: this.settingInfo.find(s => s.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch).moduleId,
      switch: DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch,
      value: this.propertyInfo.controls[DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch].value ? this.propertyInfo.controls[DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch].value : 0
    });
    _body.push({
      id: this.settingInfo.find(setting => setting.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch).id,
      moduleId: this.settingInfo.find(s => s.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch).moduleId,
      switch: DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch,
      value: this.propertyInfo.controls[DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch].value ? this.propertyInfo.controls[DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch].value : 0
    });
    _body.push({
      id: this.settingInfo.find(setting => setting.switch == defaultThemeColorSwitch).id,
      moduleId: this.settingInfo.find(s => s.switch == defaultThemeColorSwitch).moduleId,
      switch: defaultThemeColorSwitch,
      value: this.propertyInfo.controls[defaultThemeColorSwitch].value ? this.propertyInfo.controls[defaultThemeColorSwitch].value : 0
    });
    return _body;
  }
  formPropertyData(): PropertyConfig {
    let _body: any = {};
    _body.propertyContacts = [];
    const aa = this.propertyInfo.controls['address'].value;
    let _phone = this.propertyInfo.controls['phone'].value;
    _body.propertyName = this.propertyInfo.controls['name'].value;
    _body.propertyCode = this.propertyInfo.controls['propCode'].value;
    _body.tenantId = this.propertyInfo.controls['tenantId'].value;
    _body.languageCode = this.propertyInfo.controls['language'].value;
    _body.city = this.propertyInfo.controls['city'].value;
    _body.state = this.propertyInfo.controls['state'].value;
    _body.country = this.propertyInfo.controls['country'].value;
    _body.zip = this.propertyInfo.controls['postalcode'].value;
    _body.propertyId = parseInt(this.localization.GetPropertyInfo('PropertyId'));
    _body.address1 = this.propertyInfo.controls.address.value[0].addressDetails;
    _body.address2 = (aa.length < 2) ? '' :
      (this.propertyInfo.controls.address.value[1].addressDetails) == null ? '' : this.propertyInfo.controls.address.value[1].addressDetails;
    _body.address3 = (aa.length < 3) ? '' :
      (this.propertyInfo.controls.address.value[2].addressDetails) == null ? '' : this.propertyInfo.controls.address.value[2].addressDetails;
    for (let temp = 0; temp < _phone.length; temp++) {
      const phoneItem = _phone[temp];
      if (phoneItem.phonetype != null) {
        const ph = phoneItem.phonelabel == null ? this.PhoneType[1] : phoneItem.phonelabel;
        let phone: PhNumber;
        const contactType = this.PhoneType.filter(res => res.description === ph);
        phone = {
          id: temp + 1,
          number: phoneItem && phoneItem.phonenumber ? (phoneItem.phonenumber).replace(/\D/g, '') : '',
          propertyId: _body.propertyId = this.localization.GetPropertyInfo('PropertyId'),
          contactTypeId: (contactType && contactType.length ? contactType[0].id : 0).toString(),
          clientId: 1
        };
        _body.propertyContacts.push(phone);
      }
    }
    return _body;
  }

  validateProperty(): boolean {
    return (this.propertyInfo.valid && this.propertyInfo.dirty) && this.propertyInfo.touched;
  }

  PropertSetting() {
    let address: any;
    if (this.propertyInformation) {
      address = [this.propertyInformation.address1, this.propertyInformation.address2, this.propertyInformation.address3,];
    } else {
      this.addAddress(0, '');
    }
    const phone: any = this.propertyInformation ? this.propertyInformation.propertyContacts : null;
    this.propertyInfo.controls.name.setValue(this.propertyInformation ? this.propertyInformation.propertyName : '');
    this.propertyInfo.controls.postalcode.setValue(this.propertyInformation ? this.propertyInformation.zip : '');
    this.propertyInfo.controls.state.setValue(this.propertyInformation ? this.propertyInformation.state : '');
    this.propertyInfo.controls.city.setValue(this.propertyInformation ? this.propertyInformation.city : '');
    this.propertyInfo.controls.country.setValue(this.propertyInformation ? this.propertyInformation.country : '');
    this.propertyInfo.controls.language.setValue(this.propertyInformation ? this.propertyInformation.languageCode : '');
    this.propertyInfo.controls.tenantId.setValue(this.propertyInformation ? this.propertyInformation.tenantId : '');
    this.propertyInfo.controls.propCode.setValue(this.propertyInformation ? this.propertyInformation.propertyCode : '');

    //Set Default Configuration Switches
    if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch)) {
      const defaultEmailType = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch);
      this.propertyInfo.controls.DEFAULT_EMAIL_TYPE.setValue(defaultEmailType && Number(defaultEmailType.value) > 0 ? Number(defaultEmailType.value) : '');
    }
    if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch)) {
      const defaultPhoneType = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch);
      this.propertyInfo.controls.DEFAULT_PHONE_TYPE.setValue(defaultPhoneType && Number(defaultPhoneType.value) > 0 ? Number(defaultPhoneType.value) : '');
    }
    if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch)) {
      const defaultPhoneCode = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch);
      this.propertyInfo.controls.DEFAULT_COUNTRY_CODE.setValue(defaultPhoneCode && Number(defaultPhoneCode.value) > 0 ? Number(defaultPhoneCode.value) : '');
    }
    if (this.settingInfo.some(f => f.switch == defaultThemeColorSwitch)) {
      const defaultThemeColor = this.settingInfo.find(f => f.switch == defaultThemeColorSwitch);
      this.propertyInfo.controls.THEME_COLOR.setValue(defaultThemeColor ? defaultThemeColor.value : '');
    }

    this.clearFormArray(this.propertyInfo.get('address') as UntypedFormArray);
    for (let index = 0; index < address.length; index++) {
      if ((address[index] && address[index].trim() != '') || index == 0)
        this.addAddress(index, address[index]);
    }
    this.clearFormArray(this.propertyInfo.get('phone') as UntypedFormArray);
    if (phone != null && (!this.phone || this.phone.length != phone.length)) {
      for (let index = 0; index < phone.length; index++) {
        if ((phone[index].number && phone[index].number.toString().trim() != '') || index == 0) {
          const contactType = this.PhoneType.filter(res => res.id === phone[index].contactTypeId);
          this.addPhoneItem(index, contactType && contactType.length ? contactType[0].description : contactType[0], phone[index].number);
        }
      }
    } else {
      this.addPhoneItem(0, '', '');
    }
    const phonenumbers = this.propertyInfo.get('phone') as UntypedFormArray;
    phonenumbers.controls.forEach((obj: UntypedFormGroup) => {
      if (!obj.value['phonelabel']) {
        obj.get('phonenumber').disable();
      }
    });
  }
  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams?: any[]): void {
    if (callDesc == 'GetSettingByModule') {
      this.settingInfo = <any>result.result;

      //Set Default Configuration Switches
      if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch)) {
        const defaultEmailType = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultEmailTypeSwitch);
        this.propertyInfo.controls.DEFAULT_EMAIL_TYPE.setValue(defaultEmailType && Number(defaultEmailType.value) > 0 ? Number(defaultEmailType.value) : '');
      }
      if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch)) {
        const defaultPhoneType = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultPhoneTypeSwitch);
        this.propertyInfo.controls.DEFAULT_PHONE_TYPE.setValue(defaultPhoneType && Number(defaultPhoneType.value) > 0 ? Number(defaultPhoneType.value) : '');
      }
      if (this.settingInfo.some(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch)) {
        const defaultPhoneCode = this.settingInfo.find(f => f.switch == DefaultFieldConfigurationSwitches.defaultCountryPhoneCodeSwitch);
        this.propertyInfo.controls.DEFAULT_COUNTRY_CODE.setValue(defaultPhoneCode && Number(defaultPhoneCode.value) > 0 ? Number(defaultPhoneCode.value) : '');
      }

      this.RequiredFieldsSetting();
      this.enableSave = false;
    } else if (callDesc == 'GetPropertyInfoByPropertyId') {
      this.propertyInformation = <any>result.result;
      this.PropertSetting();
      this.enableSave = false;
    } else if (callDesc == 'UpdatePropertyInfoByPropertyId') {
      this.GetPropertyInfo();
      this.enableSave = false;
    } else if (callDesc == 'UpdateSetting') {
      this.GetAllSetting();
      this.reloadSession();
      this.enableSave = false;
    }
    else if (callDesc == 'GetAllLanguages') {
      [this.initialLoads, this.callCounter] = this.ss.updateInitalLoads(true, this.initialLoads, this.callCounter);
      if (result.result) {
        const data = <any>result.result;
        this.languageType = data.map(x => { return { id: x.languageID, value: x.languageName, code: x.languageCode }; });
      }
    }
  }
  async reloadSession() {
    setTimeout(() => {
      let getThemeColor: any = document.getElementsByClassName('theme-color-wrapper')[0];
      let textColor: any = document.getElementsByClassName('theme-color-wrapper')[0].children[0];
      textColor.style.color = "",
      getThemeColor.style.setProperty("background-color", JSON.parse(sessionStorage.getItem('defaultSettings'))?.find(x => x.switch == "THEME_COLOR").value, "important");
      textColor.style.setProperty("color", this.colorPickerModifier.transform(JSON.parse(sessionStorage.getItem('defaultSettings'))?.find(x=>x.switch == "THEME_COLOR").value) ? '#fff' : '#000' , "important");
    }, 500);
  }
  cancel() {
    this.PropertSetting();
    this.enableSave = false;
  }

  formAndPatchRequiredFieldsData(_appJSON) {
    _appJSON['requiredFields'] = [_appJSON, _appJSON, _appJSON];
    this.propertyInfo.patchValue(_appJSON);
  }
  addAddressDetails() {
    const addressDetails = this.propertyConfigurationDetails.address;
    const arr = [];
    for (let i = 0; i < addressDetails; i++) {
      arr.push(this.fb.group({
        address: addressDetails[i].address
      }));
    }
    return arr;
  }

  convertStringToBoolean(value: string): boolean {
    return value == 'true' ? true : false;
  }

  errorCallback<T>(error: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc = 'GetAllSetting') {
      this.systemConfig.systemConfigValues = this.settingInfo;
    }
    if (callDesc == 'UpdateSetting') {
      this.systemConfig.systemConfigValues = this.settingInfo;
    }
    if (callDesc == 'GetAllLanguages' || callDesc == 'GetCustomFields') {
      [this.initialLoads, this.callCounter] = this.ss.updateInitalLoads(true, this.initialLoads, this.callCounter);
    }
  }

  clearFormArray(formArray: UntypedFormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  onPhChange($event, i, item) {

    item['controls']['phonenumber'].enable();
    //settingEmptyvalues 
    if (!$event.value) {
      item.reset();
      item['controls']['phonenumber'].disable();
      item.markAsDirty();
    }

  }
  changeColor($event: any) {
    this.propertyInfo.controls['THEME_COLOR'].setValue($event.color.hex);
    this.enableSave = true;
  }
}
