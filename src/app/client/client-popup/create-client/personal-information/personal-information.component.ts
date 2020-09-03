import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter, Output, Input, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { Host, ImgRefType, SPAManagementBreakPoint, Module, DefaultGUID, ButtonType } from 'src/app/common/shared/shared/globalsContant';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressComponent } from 'ngx-google-places-autocomplete/objects/addressComponent';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { RetailStandaloneLocalization } from '../../../../core/localization/retailStandalone-localization';
import * as _ from 'lodash';
import { PropertyInformation } from '../../../../core/services/property-information.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientCommonService } from 'src/app/client/client.service';
import { RetailFeatureFlagInformationService } from 'src/app/retail/shared/service/retail.feature.flag.information.service';
import { PatronInfoSearchResultType, Addresscomponent, ImageData, Imagedata } from 'src/app/shared/shared-models';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { EmptyValueValidator } from 'src/app/retail/shared/Validators/EmptyValueValidator';
import { PhoneTypes, ContactType, GuestProfileMailTypes } from 'src/app/common/shared/shared/enums/enums';
// import { RetailImageService } from 'src/app/shared/data-services/Image/retail.Image.service';
import { CreateClientBusiness } from '../../client-popup.business';
import { AppModuleService } from 'src/app/core/services/app.service';
import { PlayerInformationService } from 'src/app/common/shared/shared/service/player.information.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { RetailImageService } from 'src/app/shared/data-services/retail.image.service';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CreateClientBusiness]
})
export class PersonalInformationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() parentForm: FormGroup;
  @Output() imageUpdateEmit = new EventEmitter();
  thumbnailImg: any;
  commonCaptions: any;
  isClientViewOnly = false;
  phoneTypes = PhoneTypes;
  @Input() clientEditData: any;
  phoneCountArray: any = [{ id: 0, removeLine: false, addLine: true }];
  addressLineArray: any = [{ id: 0, addLine: true, removeLine: false }];
  personalDetails: any = [];
  personalDetailsForm: FormGroup;
  maxDate = this.PropertyInfo.CurrentDate;
  FormGrp: FormGroup;
  contactTypeEmail: any = [];
  contactTypePhone: any = [];
  clientConfiguration: any = [];
  currentaddIndex: any = 0;
  currentIndexemail: any = 0;
  currentIndexPhone: any = 0;
  selectedEmail: any;
  validateEmailType: string;
  validatePhoneType: string;
  titles = [{ id: 1, value: 'Dr.' }, { id: 2, value: 'Fr.' }, { id: 3, value: 'Miss' },
  { id: 4, value: 'Mr.' }, { id: 5, value: 'Mrs.' }, { id: 6, value: 'Ms.' },
  { id: 7, value: 'Prof.' }, { id: 8, value: 'Rev.' }];
  placeNotfound: boolean;
  Phone: any = [];
  options = {
    types: ['geocode']
    // componentRestrictions: { country: "US" }
  };
  @Output() personalInfoParams: EventEmitter<any> = new EventEmitter();
  Email: any = [];
  genderList: any[] = [];
  IsEdit: boolean;
  captions: any;
  selectedFile: any;
  url: any;
  isImageRemoved: boolean =false;
  ImageUploaded: boolean = false;
  editImageId: any;
  imageId: number;
  imageObj: any;
  textmaskFormat: string;
  emailRequired: boolean;
  phoneRequired: boolean;
  AddressRequired: boolean;
  isPatronIdAvailable = false;
  showLoader = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  isCMSConfigured = false;
  mailTypes = GuestProfileMailTypes;
  Address: any = [];
  personalInfo : any = [];
  @Input('inputData')
  set formData(value) {
    if(value && value.data!='')
    {
      this.personalInfo = value.data;
      this.SetEditValues(value.data);
    }
  }
  constructor(
    private Form: FormBuilder,
    private http: HttpServiceCall,
    public localization: RetailStandaloneLocalization,
    private utils: RetailUtilities,
    private BP: BreakPointAccess,
    private PropertyInfo: PropertyInformation,
    private clientCommonService: ClientCommonService,
     public _imageService: RetailImageService,
    private _createClientBusiness: CreateClientBusiness,
    private featureSwitch: RetailFeatureFlagInformationService,
    private _playerService: PlayerInformationService,
    private _ams: AppModuleService
  ) {

    this.captions = this.localization.captions.bookAppointment;
    this.commonCaptions = this.localization.captions.common;
    this.genderList = [{ text: this.captions['Male'], value: 'Male' }, { text: this.captions['Female'], value: 'Female' }];

    this.FormGrp = this.Form.group({
      id : 0,
      guestId : DefaultGUID,
      firstName: ['', [Validators.required, EmptyValueValidator]],
      lastName: ['', [Validators.required, EmptyValueValidator]],
      pronounced: '',
      dob: '',
      pincode: '',
      title: '',
      gender: '',
      Email: this.Form.array([this.createEmailItem(0, '', '', false, false)]),
      Phone: this.Form.array([this.createPhoneItem(0, '', '', '', false, false, '')]),
      Address: this.Form.array([this.createAddressItem('', false)]),
      emailPrimary: false,
      phonePrimary: false,
      state: '',
      city: '',
      country: '',
      postal_code: '',
      patronid: '',
      rank: '',
      imageReferenceId: '',
      lastChangeId :DefaultGUID,
      interfaceGuestId :'',
      guestImg: this.Form.group({
        base64textString: '',
        thumbnailImg: ''
      }),
    });
    this.isCMSConfigured = this.featureSwitch.IsCMSConfigured;
  }

  ngAfterViewChecked(): void {

  }
  ngAfterViewInit() {

  this.FormGrp.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
    data.base64textString = this.base64textString;
    data.thumbnailImg = this.thumbnailImg;
    data['imageId'] = this.imageId;
    data.isImageRemoved = this.isImageRemoved;
    
  });
  
}
  createAddressItem(address?: any, addressPrivate?: any): FormGroup {
    return this.Form.group({
      addressLine: [address !== '' ? address : '', this.AddressRequired ? [Validators.required, EmptyValueValidator] : ''],
      privateAddress: addressPrivate
    });
  }

  addAddressItem(idx: any, addressLine?: any, addressPrivate?: any): void {

    this.currentaddIndex = idx + 1;
    this.Address = this.FormGrp.get('Address') as FormArray;
    if (this.Address.controls.length > 2) {
      return;
    }
    this.Address.push(this.createAddressItem(addressLine, addressPrivate));
  }

  removeAddressItem(i) {
    this.Address.removeAt(i);
    this.currentaddIndex = i - 1;

  }


  createEmailItem(arr: number, EmailLabel?: any, EmailId?: any, EmailIsPrivate?: any, EmailIsPrimary?: any): FormGroup {

    return this.Form.group({
      EmailLabel: [EmailLabel, this.emailRequired || EmailId ? [Validators.required, EmptyValueValidator] : ''],
      EmailId: [EmailId, this.emailRequired ? [Validators.required, Validators.email, EmptyValueValidator] : ''],
      EmailPrimary: EmailIsPrimary,
      EmailPrivate: EmailIsPrivate
    });
  }


  addEmailItem(i, EmailLabel?: any, EmailId?: any, EmailIsPrivate?: any, EmailIsPrimary?: any): void {
    this.currentIndexemail = i + 1;
    this.Email = this.FormGrp.get('Email') as FormArray;
    this.Email.push(this.createEmailItem(i, EmailLabel, EmailId, EmailIsPrivate, EmailIsPrimary));
  }

  removeEmailItem(i: any, d?: any, f?: any) {
    this.Email.removeAt(i);
    this.currentIndexemail = i - 1;
  }

  removePhoneItem(i: any, e?: any, d?: any) {
    this.Phone.removeAt(i);
    this.currentIndexPhone = i - 1;
  }

  createPhoneItem(arr: number, phoneNoLabel: any, countryCode: any, phoneNoDetails: any,
                  phoneIsPrivate: any, phoneIsPrimary: any, extension?: any): FormGroup {
    return this.Form.group({
      PhoneNumberLabel: [phoneNoLabel, this.phoneRequired || phoneNoDetails ? [Validators.required, EmptyValueValidator] : ''],
      countryCode: [countryCode, this.setCountryCodeValidator(this.phoneRequired, phoneNoLabel)],
      PhoneNumber: [phoneNoDetails, this.phoneRequired ? [Validators.required, EmptyValueValidator] : ''],
      PhonePrivate: phoneIsPrivate,
      PhonePrimary: phoneIsPrimary,
      Extension: extension
    });
  }

  setCountryCodeValidator(phoneRequired, phoneNoLabel) {
    if (phoneRequired && phoneNoLabel && phoneNoLabel === 1) {
      return [Validators.required, EmptyValueValidator];
    } else {
      return '';
    }
  }

  makeFormDirty() {
    this.FormGrp.markAsDirty();
  }

  addPhoneItem(i, phoneNoLabel: any, countryCode: any, phoneNoDetails: any,
               phoneIsPrivate: any, phoneIsPrimary: any, extension: any = ''): void {
    this.Phone = this.FormGrp.get('Phone') as FormArray;
    this.Phone.push(this.createPhoneItem(i, phoneNoLabel, countryCode, phoneNoDetails, phoneIsPrivate, phoneIsPrimary, extension));
    this.currentIndexPhone = i + 1;
  }

  togglePrimaryContact(formArrayName: string, formGroupName: any, formControlName: any) {
    const arr = this.FormGrp.get(formArrayName) as FormArray;
    const ctrls = arr.controls.filter((x, idx) => idx != formGroupName);
    ctrls.forEach(x => {
      const grp = x as FormGroup;
      grp.controls[formControlName].setValue(false);
    });
  }


  // enabling the extension only if the selected value is 'Office'
  enableExtension(index: number): boolean {
    const phoneControlsArr: any = this.FormGrp.get('Phone') as FormArray;
    const phoneNoSelectedValue: any = phoneControlsArr.at(index).get('PhoneNumberLabel').value;
    let officeDesc = '';
    if (phoneNoSelectedValue) {
      const officeNo = this.contactTypePhone.find(d => d.id == phoneNoSelectedValue);
      officeDesc = officeNo ? officeNo.description : '';
    }
    return (this.localization.captions.common.Work.toLowerCase() == officeDesc.toLowerCase());
  }

  ngOnInit() {
    this.initializeFormData();
    if(this.parentForm) {
      this.parentForm.addControl('personalDetailsFormGroup', this.FormGrp);
    }
  }

  initializeFormData() {
    this.textmaskFormat = this.localization.captions.common.PhoneFormat != '' ? 
                          this.localization.captions.common.PhoneFormat : '999999999999999999';
  //  this.makeGetCall('GetClientConfiguration');
    this.contactTypePhone = this.getPhoneOptions();
    this.contactTypeEmail = this.getMailOptions();
    this.validateEmailType = this.localization.getError(-87);
    this.validatePhoneType = this.localization.getError(-88);
    // this.appointmentService.isClientViewOnly = false;
    
    //   this.appointmentService.clientScreenBreakPoints = this.BP.GetBreakPoint([SPAManagementBreakPoint.EditClientProfile, SPAManagementBreakPoint.EditClientPreferences, SPAManagementBreakPoint.EditSOAPNotes]).result
    //   this.appointmentService.isClientViewOnly = this.appointmentService.clientScreenBreakPoints ? this.appointmentService.clientScreenBreakPoints.filter(x => x.breakPointNumber == SPAManagementBreakPoint.EditClientProfile)[0].view : false;
      //  this.SetEditValues(this.personalInfo);
    //   if (this.appointmentService.isClientViewOnly) {
    //     this.utils.disableControls(this.FormGrp);
    //   }
    // }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  Validation(clientConfiguration: any) {
    clientConfiguration = clientConfiguration ? clientConfiguration : [];
    if (clientConfiguration && clientConfiguration.length == 0) { return; }

    this.FormGrp.controls['firstName'].clearValidators();
    this.FormGrp.controls['firstName'].setValidators(clientConfiguration[0]['CLIENT_FIRST_NAME'] ?
    [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['firstName'].updateValueAndValidity();

    this.FormGrp.controls['lastName'].clearValidators();
    this.FormGrp.controls['lastName'].setValidators(clientConfiguration[0]['CLIENT_LAST_NAME'] ?
    [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['lastName'].updateValueAndValidity();

    this.FormGrp.controls['title'].clearValidators();
    this.FormGrp.controls['title'].setValidators(clientConfiguration[0]['CLIENT_TITLE'] ? [Validators.required] : []);
    this.FormGrp.controls['title'].updateValueAndValidity();

    this.FormGrp.controls['gender'].clearValidators();
    this.FormGrp.controls['gender'].setValidators(clientConfiguration[0]['CLIENT_GENDER'] ? [Validators.required] : []);
    this.FormGrp.controls['gender'].updateValueAndValidity();

    this.FormGrp.controls['state'].clearValidators();
    this.FormGrp.controls['state'].setValidators(clientConfiguration[0]['CLIENT_STATE'] ? [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['state'].updateValueAndValidity();

    this.FormGrp.controls['city'].clearValidators();
    this.FormGrp.controls['city'].setValidators(clientConfiguration[0]['CLIENT_CITY'] ? [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['city'].updateValueAndValidity();

    this.FormGrp.controls['country'].clearValidators();
    this.FormGrp.controls['country'].setValidators(clientConfiguration[0]['CLIENT_COUNTRY'] ?
    [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['country'].updateValueAndValidity();

    this.FormGrp.controls['postal_code'].clearValidators();
    this.FormGrp.controls['postal_code'].setValidators(clientConfiguration[0]['CLIENT_POSTAL_CODE'] ?
    [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['postal_code'].updateValueAndValidity();

    this.FormGrp.controls['dob'].clearValidators();
    this.FormGrp.controls['dob'].setValidators(clientConfiguration[0]['CLIENT_BIRTHDAY'] ? [Validators.required] : []);
    this.FormGrp.controls['dob'].updateValueAndValidity();

    this.emailRequired = clientConfiguration[0]['CLIENT_EMAIL'];
    this.phoneRequired = clientConfiguration[0]['CLIENT_PHONE'];
    this.AddressRequired = clientConfiguration[0]['CLIENT_ADDRESS_LINE_1'];

    const EmailArray = this.FormGrp.get('Email') as FormArray;
    EmailArray.controls.forEach((control) => {
      let EmailGroup: FormGroup;
      EmailGroup = control as FormGroup;
      EmailGroup.controls['EmailId'].clearValidators();
      EmailGroup.controls['EmailId'].setValidators(clientConfiguration[0]['CLIENT_EMAIL'] ? 
      [Validators.required, EmptyValueValidator] : []);
      EmailGroup.controls['EmailId'].updateValueAndValidity();
    });
    const PhoneArray = this.FormGrp.get('Phone') as FormArray;
    const that = this;
    PhoneArray.controls.forEach((control, index) => {
      let PhoneGroup: FormGroup;
      PhoneGroup = control as FormGroup;

      PhoneGroup.controls['countryCode'].clearValidators();
      PhoneGroup.controls['countryCode'].setValidators(clientConfiguration[0]['CLIENT_PHONE'] ? 
      [Validators.required, EmptyValueValidator] : []);
      that.setmandatory('event', 'PhoneNumber', 'countryCode', 'PhoneNumberLabel', index);
      PhoneGroup.controls['countryCode'].updateValueAndValidity();

      PhoneGroup.controls['PhoneNumber'].clearValidators();
      PhoneGroup.controls['PhoneNumber'].setValidators(clientConfiguration[0]['CLIENT_PHONE'] ? 
      [Validators.required, EmptyValueValidator] : []);
      PhoneGroup.controls['PhoneNumber'].updateValueAndValidity();
    });
    const AddresArray = this.FormGrp.get('Address') as FormArray;
    AddresArray.controls.forEach(function (control) {
      let AddressGroup: FormGroup;
      AddressGroup = control as FormGroup;
      AddressGroup.controls['addressLine'].clearValidators();
      AddressGroup.controls['addressLine'].setValidators(clientConfiguration[0]['CLIENT_ADDRESS_LINE_1'] ? 
      [Validators.required, EmptyValueValidator] : []);
      AddressGroup.controls['addressLine'].updateValueAndValidity();
    });

    this.FormGrp.updateValueAndValidity();
  }


  PostalCodeChanged(e, IsAutoComplete) {
    const inputPin = this.FormGrp.controls['postal_code'].value;
    this.http
      .getHTTPData(
        'http://maps.googleapis.com/maps/api/geocode/json?address=' + inputPin
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => this.bindAddressFromGoogle(result, IsAutoComplete));
  }

  bindAddressFromGoogle(res: any, IsAutoComplete?, index?: number) {
    this.placeNotfound = false;
    if (IsAutoComplete) {
      this.updateAddressField(res.address_components, true, index);
      if (!res.status) {
        this.googleAutoCompleteAddressLineBinding(index);
      }
      return;
    }
    if (res.status == 'OK') {
      if (IsAutoComplete) {
        const result: any = res;
        this.updateAddressField(res.address_components, true, index);
      } else {
        this.updateAddressField(res.results[0].address_components, false, index);
      }
    }
    if (res.status == 'ZERO_RESULTS') {
      this.placeNotfound = true;
      this.clearAddressFields();
    }
    if (res.status == 'OVER_QUERY_LIMIT') {

      // this.PostalCodeChanged("", IsAutoComplete);
    }
    if (!res.status) {
      this.googleAutoCompleteAddressLineBinding(index);
    }
  }

  googleAutoCompleteAddressLineBinding(index) {
    // google auto complete from search
    const addressFormArr = this.FormGrp.get('Address') as FormArray;
    // populating auto completed value from text box(work around for angular issue)
    const addressCtl: any = document.getElementById('AddressInput' + index);
    const addressAutoPopulated: string = addressCtl.value;
    addressFormArr.at(index).patchValue({ 'addressLine': addressAutoPopulated });
    const ctrl: any = addressFormArr.at(index);
    ctrl.controls.addressLine.setErrors(null);
  }

  updateAddressField(add: Addresscomponent[], IsAutoComplete: boolean, index?: number) {
    let country = '';
    let state = '';
    let city = '';
    let googlePostalCode: string;
    if (add) {
      const addressFormArr = this.FormGrp.get('Address') as FormArray;
      addressFormArr.at(0).patchValue({ 'addressLine': ((add[0] && add[0].long_name) ? add[0].long_name.toString() : '')
      + ' ' + ((add[1] && add[1].long_name) ? add[1].long_name.toString() : '') });
      const ctrl: any = addressFormArr.at(index);
      ctrl.controls.addressLine.setErrors(null);
    }
    for (let i = 0; i < add.length; i++) {
      const element = add[i];
      // if (element.types[0] == "locality") {
      //   _line1 = element.long_name;
      // }
      if (element.types[0] == 'administrative_area_level_1') {
        state = element.long_name;
      }
      if (element.types[0] == 'locality') {
        city = element.long_name;
      }
      if (element.types[0] == 'country') {
        country = element.long_name;
      }
      if (element.types[0] == 'postal_code') {
        googlePostalCode = element.long_name;
      }
    }

    if (googlePostalCode == this.FormGrp.controls['postal_code'].value || IsAutoComplete) {
      this.FormGrp.controls['city'].setValue(city);
      this.FormGrp.controls['country'].setValue(country);
      this.FormGrp.controls['state'].setValue(state);
      this.FormGrp.controls['postal_code'].setValue(googlePostalCode);
    } else {
      this.placeNotfound = true;
      this.clearAddressFields();
    }
  }
  clearAddressFields() {
    this.FormGrp.controls['city'].setValue('');
    this.FormGrp.controls['country'].setValue('');
    this.FormGrp.controls['state'].setValue('');
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
      extraParams: ['dataBelongTo']
    });
  }

  successCallback<T>(
    result: BaseResponse<T>,
    callDesc: string,
    extraParams?: any[]
  ) {
    switch (callDesc) {
      case 'GetClientConfiguration':
        this.clientConfiguration = result.result as any;
      //  this.Validation(this.clientConfiguration);
        break;
      case 'getImagesByReference': {
        const imageDetails = result.result;
        // this.appointmentService.clientImageChange(result.result);
        // this.appointmentService.clientHasPic = false;
        if (imageDetails[0]) {
          // this.appointmentService.clientHasPic = true;
          // this.bindImage(imageDetails[0].contentType, imageDetails[0].data)
          this.url = `${imageDetails[0].contentType},${imageDetails[0].data}`;
          this.editImageId = imageDetails[0].id;
        }
      }
                                   break;
    }
  }
  errorCallback() { }
  countFunctionAdd(index, e) {
    e.preventDefault();
    if (this.phoneCountArray.length < 5) {
      this.phoneCountArray.push({
        id: index + 1,
        removeLine: true,
        addLine: true
      });
      this.phoneCountArray[index].removeLine = true;
      this.phoneCountArray[index].addLine = false;
    }
  }

  countFunctionRemove(index, e) {
    e.preventDefault();
    if (index == this.phoneCountArray.length - 1) {
      if (this.phoneCountArray.length == 2) {
        this.phoneCountArray.splice(index, 1);
        this.phoneCountArray[index - 1].addLine = true;
        this.phoneCountArray[index - 1].removeLine = false;
      } else if (this.phoneCountArray.length > 1) {
        this.phoneCountArray.splice(index, 1);
        this.phoneCountArray[index - 1].addLine = true;
        this.phoneCountArray[index - 1].removeLine = true;
      }
    } else if (this.phoneCountArray.length == 2) {
      this.phoneCountArray.splice(index, 1);
      this.phoneCountArray[0].addLine = true;
      this.phoneCountArray[0].removeLine = false;
    } else {
      this.phoneCountArray.splice(index, 1);
    }
  }
  addAddressLine(index, e) {
    e.preventDefault();
    if (this.addressLineArray.length < 3) {
      this.addressLineArray.push({
        id: index + 1,
        addLine: true,
        removeLine: false
      });
      this.addressLineArray[index].addLine = false;
      this.addressLineArray[index].removeLine = true;
    }
  }
  removeAddressLine(index, e) {
    e.preventDefault();
    this.addressLineArray.splice(index, 1);
  }
  autoCompleteCallback1(e: Address) {
    const addressArr: AddressComponent[] = [];
    let _line1 = '';
    let _line2 = '';
    let _line3 = '';
    let _state = '';
    let _country = '';
    let _zip = '';

    for (let i = 0; i < e.address_components.length; i++) {
      const element = e.address_components[i];
      if (element.types[0] == 'locality') {
        _line1 = element.long_name;
      }
      if (element.types[0] == 'administrative_area_level_1') {
        _line2 = element.long_name;
      }
      if (element.types[0] == 'administrative_area_level_2') {
        _line3 = element.long_name;
      }
      if (element.types[0] == 'country') {
        _country = element.long_name;
      }
      if (element.types[0] == 'postal_code') {
        _zip = element.long_name;
      }
    }
    this.FormGrp.controls['pincode'].setValue(_zip);

  }

  @ViewChild('placesRef', { static: false }) placesRef: GooglePlaceDirective;

  public handleAddressChange(address: Address) {
    // Do some stuff
  }

  async SetEditValues(clientInfo) {
    let loyalty = clientInfo.client && clientInfo.client.loyaltyDetail && clientInfo.client.loyaltyDetail.length > 0 ? clientInfo.client.loyaltyDetail[0] : null;
    let isCMSDataChanged: boolean = false;
    if (loyalty && loyalty.patronId && this.isCMSConfigured) {
          isCMSDataChanged = await this.UpdateCMSDetailOnExistingGuest(loyalty.patronId, clientInfo,
          this.searchPatronCallBack.bind(this));
      loyalty = clientInfo.client.loyaltyDetail[0];
      if (!loyalty) {
        this.isPatronIdAvailable = false;
        this.FormGrp.controls.patronid.markAsDirty();
      }
      else {
        this.isPatronIdAvailable = true;
        this.FormGrp.reset();
      }
      isCMSDataChanged ? this.FormGrp.markAsDirty() : '';
    }
    else {
      this.isPatronIdAvailable = false;
    }
    this.personalDetails = clientInfo.client;
    this.FormGrp.controls.lastChangeId.setValue(clientInfo.client.lastChangeId);
    this.FormGrp.controls.interfaceGuestId.setValue(clientInfo.client.interfaceGuestId);
    this.FormGrp.controls.id.setValue(clientInfo.client.id);
    this.FormGrp.controls.guestId.setValue(clientInfo.client.guestId);
    this.FormGrp.controls.title.setValue(this.utils.GetGuestIdbyTitle(clientInfo.client.title));
    this.FormGrp.controls.firstName.setValue(clientInfo.client.firstName);
    this.FormGrp.controls.lastName.setValue(clientInfo.client.lastName);
    this.FormGrp.controls.pronounced.setValue(clientInfo.client.pronounce);
    this.FormGrp.controls.gender.setValue(clientInfo.client.gender);
    this.FormGrp.controls.dob.setValue(
      clientInfo.client.dateOfBirth ?
        this.utils.getDate(clientInfo.client.dateOfBirth)
        : ""
    );

    this.FormGrp.controls.patronid.setValue(loyalty ? loyalty.patronId : '');
    this.FormGrp.controls.rank.setValue(loyalty ? loyalty.rank : '');
    if (clientInfo.addresses && clientInfo.addresses!= null) {
      this.FormGrp.controls.postal_code.setValue(clientInfo.addresses.zipCode);
      this.FormGrp.controls.state.setValue(clientInfo.addresses.state);
      this.FormGrp.controls.city.setValue(clientInfo.addresses.city);
      this.FormGrp.controls.country.setValue(clientInfo.addresses.country);
    }
    
    if (clientInfo.phoneNumbers && clientInfo.phoneNumbers.length > 0) {
      clientInfo.phoneNumbers.forEach((element, i) => {
        let _extension = element.extension ? element.extension : ''
        let _countryCode = element.countryCode ? element.countryCode : ''
        if (element.number != '') {
          if (element.contactTypeId === 3) { //Added For Extension when contact type is work
            if (element.number.indexOf(':') !== -1) {
              const arr = element.number.split(':');
              element.number = arr.length > 1 ? arr[1] : element.number;
              _extension = arr[0] ? arr[0] : '';
            } else {
              _extension = '';
            }
          }

          if (element.number.indexOf('|') !== -1) {
            const phonenum = element.number.split('|');
            element.number = phonenum[1];
            _countryCode = phonenum[0];
          }
        }
        this.addPhoneItem(i, element.contactTypeId, _countryCode, this.utils.appendFormat(element.number, this.localization.captions.common.PhoneFormat), element.isPrivate, element.isPrimary, _extension);
      });
      this.Phone.removeAt(0);
    }

    if (clientInfo.emails && clientInfo.emails.length > 0) {
      clientInfo.emails.forEach((element, i) => {
        this.addEmailItem(i, element.contactTypeId, element.emailId, element.isPrivate, element.isPrimary);
      });
      this.Email.removeAt(0);
    }

    if (clientInfo.addresses && clientInfo.addresses != null) {
      let addressItem = clientInfo.addresses;
      if (addressItem.addressLine1) {
        this.addAddressItem(0, addressItem.addressLine1, addressItem.isPrivate)
        this.Address = this.FormGrp.get('Address') as FormArray;
        this.Address.removeAt(0);
      }
      if (addressItem.addressLine2) {
        this.addAddressItem(1, addressItem.addressLine2, addressItem.isPrivate)
      }
      if (addressItem.addressLine3) {
        this.addAddressItem(2, addressItem.addressLine3, addressItem.isPrivate)
      }

    }
    var imageData : Imagedata;
    if (clientInfo.client.guestId && clientInfo.client.guestId != DefaultGUID) {
       imageData = await this._imageService.getImageForClient(clientInfo.client.guestId, true);
    }
    var url = `${imageData && imageData[0] ? imageData[0].contentType : ''},${imageData && imageData[0] ? imageData[0].thumbnailData : ''}`
    this.url = url;
    this.imageId = imageData && imageData[0] ? imageData[0].id : '';
    this.url =  imageData && imageData[0] ?  url : '';
   // this.imageReferenceId = clientInfo.client.guestId;
  }

  onFileDelete(event) {
    this.ImageUploaded = false;
    this.makeFormDirty();
  }


  base64textString: any;
  
  fileDeleted() {
    this.isImageRemoved = true;
    this.ImageUploaded = false;
    this.base64textString ='';
    this.thumbnailImg ='';
    this.FormGrp.controls.guestImg.patchValue({
      base64textString: '',
      thumbnailImg: ''
    });
    this.FormGrp.markAsDirty();
  }

  fileUploaded(data) {
    this.FormGrp.controls.imageReferenceId.markAsTouched();
    this.FormGrp.markAsDirty();
    this.base64textString = data['orgImg'];
    this.thumbnailImg = data['tmbImg'];
    this.imageId = data['imageID'];
    this.isImageRemoved = false;
    this.FormGrp.controls.guestImg.patchValue({
      base64textString: data['orgImg'],
      thumbnailImg: data['tmbImg']
    });
  }

  fileSizeExceeded() {
    this.utils.ShowError(this.captions.common.FileSizeExceeded, this.captions.common.Error, this.captions.common.Error);
  }

  emailChange(emailid, emailLabel, index) {

    if (this.FormGrp.controls['Email']['controls'][index].controls[emailid].value &&
    !this.FormGrp.controls['Email']['controls'][index].controls[emailLabel].value) {

      this.FormGrp.controls['Email']['controls'][index].controls[emailLabel].setValidators(Validators.required);
      this.FormGrp.controls['Email']['controls'][index].controls[emailLabel].markAsTouched();
    } else {
      if (!this.emailRequired) {
        this.FormGrp.controls['Email']['controls'][index].controls[emailLabel].clearValidators();
      }
    }
    this.FormGrp.controls['Email']['controls'][index].controls[emailLabel].updateValueAndValidity();
  }

  setmandatory(eve, phoneNumber, altfield, phoneType, index) {
    if (eve && eve.target && eve.target.value) {
      this.FormGrp.controls['Phone']['controls'][index].controls[altfield].setValidators([Validators.required]);
    }
    if (phoneNumber == 'PhoneNumber') {
      if (this.FormGrp.controls['Phone']['controls'][index].controls[phoneType].value &&
      this.FormGrp.controls['Phone']['controls'][index].controls[phoneType].value === 1) {
        this.FormGrp.controls['Phone']['controls'][index].controls[altfield].setValidators(Validators.required);
      } else {
        this.FormGrp.controls['Phone']['controls'][index].controls[altfield].clearValidators();
      }
    }
    this.FormGrp.controls['Phone']['controls'][index].controls[altfield].markAsTouched();
    this.FormGrp.controls['Phone']['controls'][index].controls[altfield].updateValueAndValidity();
  }

  phoneChange(eve, phoneNumber, altfield, phoneNumberLabel, index) {
    this.setmandatory(eve, phoneNumber, altfield, phoneNumberLabel, index);
    if (this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumber].value && 
    !this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumberLabel].value) {
      this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumberLabel].setValidators(Validators.required);
      this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumberLabel].markAsTouched();
    } else {
      if (!this.phoneRequired) {
        this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumberLabel].clearValidators();
      }
    }
    this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumberLabel].updateValueAndValidity();
  }

  playerWorthDetails(event) {
    this.clientCommonService.openDialogPopup(this.FormGrp.controls.patronid.value);
  }


  searchPatron() {
    const patronId = this.FormGrp.controls.patronid.value;
    if (patronId && patronId != '' && this.isCMSConfigured) {
       this.searchClientByPatron(patronId, this.searchPatronCallBack.bind(this));
    }
  }

    async searchClientByPatron(patronId: string, callBack: (result: any, extraParams?) => void) {
        let client = await this._createClientBusiness.searchClientByPatron(patronId);
        if (client) {
            this.utils.ShowError(this.localization.captions.common.Information, this.localization.captions.bookAppointment.EnteredPatronIDIsAlreadyAvailable, ButtonType.YesNo, 
                this.patronAlreadyExistCallBack.bind(this), [client, callBack, patronId])
        }
        else {
            this._ams.loaderEnable.next(this.localization.captions.common.LoadingPlayerInformation);
            let playerInfo = await this._playerService.GetPlayerInformation(patronId);
            this._ams.loaderEnable.next('');
            if (playerInfo && playerInfo.personalDetails) {
                if (this.featureSwitch.UpdateGuestInfoAsPerCMS || this.personalInfo!='') {
                    callBack(PatronInfoSearchResultType.UPDATECMSDATAONEXISTING, [playerInfo.personalDetails])
                }
                else {
                  this.FormGrp.controls.rank.setValue(playerInfo.personalDetails.playerRank);
                    callBack(PatronInfoSearchResultType.PATRONFOUND);
                }
            }
            else {
                this.utils.ShowErrorPopup([14110]);
                callBack(PatronInfoSearchResultType.PATRONNOTFOUND);
            }
        }
    }

    async patronAlreadyExistCallBack(result: any, extraParams?: any) {
        if (result.toLowerCase() == 'yes') { 
          this.SetEditValues(extraParams[0]);
          extraParams[1](PatronInfoSearchResultType.EDITEXISTINGPATRON);
        } else {
          extraParams[1](PatronInfoSearchResultType.PATRONNOTFOUND ,extraParams);
        }
    }

  searchPatronCallBack(result: number, extraParams?: any) {
    if (result == PatronInfoSearchResultType.EDITEXISTINGPATRON) {
      this.isPatronIdAvailable = true;
      this.initializeFormData();
      if(extraParams)
      this.SetEditValues(extraParams);
    } else if (result == PatronInfoSearchResultType.PATRONNOTFOUND) {
      this.isPatronIdAvailable = false;
      this.FormGrp.controls.patronid.setValue('');
      this.FormGrp.controls.patronid.markAsDirty();
    } else if (result == PatronInfoSearchResultType.PATRONFOUND) {
      this.isPatronIdAvailable = true;
    } else if (result == PatronInfoSearchResultType.UPDATECMSDATAONEXISTING) {
      this.FormGrp.controls.firstName.setValue(extraParams[0].firstName);
      this.FormGrp.controls.lastName.setValue(extraParams[0].lastName);
      this.FormGrp.controls.pronounced.setValue(extraParams[0].pronounced);
      this.FormGrp.controls.rank.setValue(extraParams[0].playerRank);
      this.FormGrp.controls.dob.setValue(this.utils.getDate(extraParams[0].dateOfBirth));
      this.FormGrp.controls.gender.setValue(extraParams[0].gender == 'M' ? 'Male' : extraParams[0].gender == 'F' ? 'Female' : '');
      if (extraParams[0].address) {
        this.addAddressItem(0, extraParams[0].address.addressLine1, false);
        this.FormGrp.controls.postal_code.setValue(extraParams[0].address.postalCode);
        this.FormGrp.controls.state.setValue(extraParams[0].address.state);
        this.FormGrp.controls.city.setValue(extraParams[0].address.city);
        this.FormGrp.controls.country.setValue(extraParams[0].address.country);
        this.Address.removeAt(0);
      }
      if (extraParams[0].phone && extraParams[0].phone.length > 0) {
        extraParams[0].phone.forEach((element, i) => {
          this.addPhoneItem(i, element.phoneTypeId, element.countryCode,
            this.utils.appendFormat(element.phoneNumber, this.localization.captions.common.PhoneFormat),
            false, element.isPrimary, element.extension);
        });
        this.Phone.removeAt(0);
      }
      if (extraParams[0].email && extraParams[0].email.length > 0) {
        extraParams[0].email.forEach((element, i) => {
          this.addEmailItem(i, element.emailTypeId, element.emailAddress, false, false);
        });
        this.Email.removeAt(0);
      }
      this.isPatronIdAvailable = true;
    }
    this.clearPatronValidationError();
  }

  checkPatronValidation() {
    const patronValue = this.FormGrp.controls.patronid.value;
    if (patronValue) {
      this.FormGrp.controls.patronid.setValidators(Validators.required);
      if (!this.isPatronIdAvailable) {
        this.FormGrp.controls.patronid.setErrors({ invalid: true });
      }
    } else {
      this.FormGrp.controls.patronid.clearValidators();
      this.FormGrp.controls.patronid.updateValueAndValidity();
    }
  }

  clearPatronValidationError() {
    this.FormGrp.controls.patronid.clearValidators();
    this.FormGrp.controls.patronid.updateValueAndValidity();
  }

  private getPhoneOptions() {
    return [
      { id: this.phoneTypes.home, description: this.localization.captions.common.drp_txt_home, type: ContactType.phone },
      { id: this.phoneTypes.office, description: this.localization.captions.common.drp_txt_office, type: ContactType.phone },
      { id: this.phoneTypes.mobile, description: this.localization.captions.common.drp_txt_mobile, type: ContactType.phone }
    ];
  }

  private getMailOptions() {
    return [
      { id: this.mailTypes.office, description: this.localization.captions.common.drp_txt_office, type: ContactType.email },
      { id: this.mailTypes.personal, description: this.localization.captions.common.drp_txt_personal, type: ContactType.email }
    ];
  }

  async UpdateCMSDetailOnExistingGuest(patronId, guestData, callBack?) {
    this._ams.loaderEnable.next(this.localization.captions.common.LoadingPlayerInformation);
    let playerInfo = await this._playerService.GetPlayerInformation(patronId);
    let cmsHasChange: boolean = false;
    this._ams.loaderEnable.next('');
    if (playerInfo && playerInfo.personalDetails) {
        cmsHasChange = this.isCMSDataChanged(guestData, playerInfo.personalDetails);
        if (this.featureSwitch.UpdateGuestInfoAsPerCMS) {
            let playerDetail = playerInfo.personalDetails;
            guestData.client.firstName = playerDetail.firstName;
            guestData.client.lastName = playerDetail.lastName;
            guestData.client.pronounce = playerDetail.pronounced;
            guestData.client.loyaltyDetail[0].rank = playerDetail.playerRank;
            guestData.client.dateOfBirth = playerDetail.dateOfBirth;
            if (playerDetail.gender && playerDetail.gender != 'U') {
                guestData.client.gender = playerDetail.gender == 'M' ? 'Male' : 'Female';
            }
            if (playerDetail.address) {
                guestData.addresses = [];
                guestData.addresses.push({
                    line1: playerDetail.address.addressLine1,
                    city: playerDetail.address.city,
                    state: playerDetail.address.state,
                    zip: playerDetail.address.postalCode,
                    country: playerDetail.address.country
                })
            }
            if (playerDetail.phone && playerDetail.phone.length > 0) {
                guestData.phoneNumbers = [];
                playerDetail.phone.forEach(element => {
                    guestData.phoneNumbers.push({
                        contactTypeId: element.phoneTypeId,
                        number: (element.extension ? element.extension + ':' : '') + (element.countryCode ? element.countryCode + "|" : '|') + element.phoneNumber,
                        extension: element.extension,
                        isPrimary: element.isPrimary
                    })
                });
            }
            if (playerDetail.email && playerDetail.email.length > 0) {
                guestData.emails = [];
                playerDetail.email.forEach(element => {
                    guestData.emails.push({
                        contactTypeId: element.emailTypeId,
                        emailId: element.emailAddress
                    })
                });
            }
        }
        else {
            guestData.client.loyaltyDetail[0].rank = playerInfo.personalDetails.playerRank;
        }
    }
    else {
        guestData.client.loyaltyDetail = [];
        this.utils.ShowErrorPopup([14110]);
    }
    return cmsHasChange;
}

isCMSDataChanged(existingData, cmsData): boolean {
    if (this.featureSwitch.UpdateGuestInfoAsPerCMS) {
        if (existingData.client.firstName !== cmsData.firstName ||
            existingData.client.lastName !== cmsData.lastName ||
            existingData.client.pronounce !== cmsData.pronounced ||
            existingData.client.loyaltyDetail[0].rank !== cmsData.playerRank ||
            this.utils.GetFormattedDate(existingData.client.dateOfBirth) != this.utils.GetFormattedDate(cmsData.dateOfBirth)
            ) {
            return true;
        }

        if (cmsData.gender && cmsData.gender !== 'U' && cmsData.gender !== String(existingData.client.gender).charAt(0)) {
            return true;
        }

        if (cmsData.address && (cmsData.address.addressLine1 != existingData.addresses[0].line1 ||
            cmsData.address.city != existingData.addresses[0].city ||
            cmsData.address.state != existingData.addresses[0].state ||
            cmsData.address.postalCode != existingData.addresses[0].zip ||
            cmsData.address.country != existingData.addresses[0].country)) {
            return true;
        }

        let guestPhone = _.orderBy(_.cloneDeep(existingData.phoneNumbers), 'number', 'asc');
        let formatedCMSPhone = cmsData.phone.map(x => {
            return {
                phoneNumber: x.phoneNumber,
                phoneTypeId: x.phoneTypeId,
                isPrimary: x.isPrimary,
                formattedPhone: (x.extension ? x.extension + ':' : '') + (x.countryCode ? x.countryCode + "|" : '|') + x.phoneNumber,
            }
        })
        formatedCMSPhone = _.orderBy(formatedCMSPhone, 'formattedPhone', 'asc')
        if (guestPhone && guestPhone.length == formatedCMSPhone.length) {
            for (let index = 0; index < guestPhone.length; index++) {
                if (guestPhone[index].number != formatedCMSPhone[index].formattedPhone ||
                    guestPhone[index].contactTypeId != formatedCMSPhone[index].phoneTypeId ||
                    guestPhone[index].isPrimary != formatedCMSPhone[index].isPrimary) {
                    return true;
                }
            }
        } else {
            return true;
        }

        let guestEmail = _.orderBy(_.cloneDeep(existingData.emails), 'emails', 'asc');
        let cmsEmail = _.orderBy(cmsData.email, 'emailAddress', 'asc');
        if (cmsEmail && cmsEmail.length == guestEmail.length) {
            for (let index = 0; index < cmsEmail.length; index++) {
                if (cmsEmail[index].emailAddress != guestEmail[index].emailId ||
                    cmsEmail[index].emailTypeId != guestEmail[index].contactTypeId) {
                    return true;
                }
            }
        } else {
            return true;
        }
    }
    else {
        return existingData.client.loyaltyDetail[0].rank == cmsData.playerRank ? false : true;
    }
    return false;
}

}


