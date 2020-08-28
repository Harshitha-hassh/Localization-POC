import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter, Output, Input, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { Host, ImgRefType, SPAManagementBreakPoint, Module } from 'src/app/common/shared/shared/globalsContant';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressComponent } from 'ngx-google-places-autocomplete/objects/addressComponent';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { Localization } from '../../../../core/localization/Localization';
import * as _ from 'lodash';
import { PropertyInformation } from '../../../../core/services/property-information.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientCommonService } from 'src/app/client/client.service';
import { RetailFeatureFlagInformationService } from 'src/app/retail/shared/service/retail.feature.flag.information.service';
import { PatronInfoSearchResultType, Addresscomponent, ImageData } from 'src/app/shared/shared-models';
import { Utilities } from 'src/app/common/shared/shared/utilities/utilities';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { EmptyValueValidator } from 'src/app/retail/shared/Validators/EmptyValueValidator';
import { PhoneTypes, ContactType, MailTypes } from 'src/app/common/shared/shared/enums/enums';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PersonalInformationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() parentForm: FormGroup;
  thumbnailImg: any;
  commonCaptions: any;
  isClientViewOnly = false;
  phoneTypes = PhoneTypes;

  ngAfterViewChecked(): void {

  }
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

  options = {
    types: ['geocode']
    //componentRestrictions: { country: "US" }
  };
  @Output() personalInfoParams: EventEmitter<any> = new EventEmitter();

  genderList: any[] = [];
  IsEdit: boolean;
  captions: any;
  selectedFile: any;
  url: any;
  ImageUploaded: boolean;
  editImageId: any;
  imageObj: any;
  textmaskFormat: string;
  emailRequired: boolean;
  phoneRequired: boolean;
  AddressRequired: boolean;
  isPatronIdAvailable = false;
  showLoader: boolean = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  isCMSConfigured: boolean = false;
  mailTypes = MailTypes;
  constructor(
    private Form: FormBuilder,
    private http: HttpServiceCall,
    public localization: Localization,
    private utils: Utilities,
    private BP: BreakPointAccess,
    private PropertyInfo: PropertyInformation,
    private clientCommonService: ClientCommonService,
    private _featureSwitch: RetailFeatureFlagInformationService
  ) {

    this.captions = this.localization.captions.bookAppointment;
    this.commonCaptions = this.localization.captions.common;
    this.genderList = [{ text: this.captions['Male'], value: 'Male' }, { text: this.captions['Female'], value: 'Female' }];

    this.FormGrp = this.Form.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      pronounced: '',
      dob: '',
      pincode: '',
      title: '',
      gender: '',
      Email: this.Form.array([this.createEmailItem(0, '', '', false, false)]),
      Phone: this.Form.array([this.createPhoneItem(0, '', '', '', false, false, '')]),
      Address: this.Form.array([this.createAddressItem('', false)]),
      //privateAddress: false,
      emailPrimary: false,
      // emailPrivate: false,
      //phonePrivate: false,
      phonePrimary: false,
      state: '',
      city: '',
      country: '',
      postal_code: '',
      patronid: '',
      rank: ''
    });
    this.isCMSConfigured = this._featureSwitch.IsCMSConfigured;
  }

  createAddressItem(_address?: any, _addressPrivate?: any): FormGroup {
    return this.Form.group({
      addressLine: [_address !== '' ? _address : '', this.AddressRequired ? [Validators.required, EmptyValueValidator] : ''],
      privateAddress: _addressPrivate
    });
  }
  Address: any = [];

  addAddressItem(idx: any, _addressLine?: any, _addressPrivate?: any): void {

    this.currentaddIndex = idx + 1;
    this.Address = this.FormGrp.get('Address') as FormArray;
    if (this.Address.controls.length > 2) {
      return;
    }
    this.Address.push(this.createAddressItem(_addressLine, _addressPrivate));
  }

  removeAddressItem(i) {
    this.Address.removeAt(i);
    this.currentaddIndex = i - 1;

  }


  createEmailItem(arr: number, _EmailLabel?: any, _EmailId?: any, _EmailIsPrivate?: any, _EmailIsPrimary?: any): FormGroup {

    return this.Form.group({
      //EmailLabel: [_EmailLabel,Validators.required],
      EmailLabel: [_EmailLabel, this.emailRequired || _EmailId ? [Validators.required, EmptyValueValidator] : ''],
      EmailId: [_EmailId, this.emailRequired ? [Validators.required, Validators.email, EmptyValueValidator] : ''],
      // EmailId: _EmailId,
      EmailPrimary: _EmailIsPrimary,
      EmailPrivate: _EmailIsPrivate
    });
  }
  Email: any = [];

  addEmailItem(i, _EmailLabel?: any, _EmailId?: any, _EmailIsPrivate?: any, _EmailIsPrimary?: any): void {
    this.currentIndexemail = i + 1;
    this.Email = this.FormGrp.get('Email') as FormArray;
    // if (this.Email.controls.length >= this.contactTypeEmail.length) {
    //   return;
    // }
    this.Email.push(this.createEmailItem(i, _EmailLabel, _EmailId, _EmailIsPrivate, _EmailIsPrimary));
    // this.FormGrp.get('Email')[0].push((this.createPhoneItem(i, _EmailLabel, _EmailId, _EmailIsPrivate, _EmailIsPrimary)));

  }

  removeEmailItem(i: any, d?: any, f?: any) {
    this.Email.removeAt(i);
    this.currentIndexemail = i - 1;
  }

  removePhoneItem(i: any, e?: any, d?: any) {
    this.Phone.removeAt(i);
    this.currentIndexPhone = i - 1;
  }

  Phone: any = [];

  createPhoneItem(arr: number, _phoneNoLabel: any, _countryCode: any, _phoneNoDetails: any, _phoneIsPrivate: any, _phoneIsPrimary: any, extension?: any,): FormGroup {
    return this.Form.group({
      PhoneNumberLabel: [_phoneNoLabel, this.phoneRequired || _phoneNoDetails ? [Validators.required, EmptyValueValidator] : ''],
      countryCode: [_countryCode, this.setCountryCodeValidator(this.phoneRequired, _phoneNoLabel)],
      PhoneNumber: [_phoneNoDetails, this.phoneRequired ? [Validators.required, EmptyValueValidator] : ''],
      // PhoneNumber: _phoneNoDetails,
      PhonePrivate: _phoneIsPrivate,
      PhonePrimary: _phoneIsPrimary,
      Extension: extension
    });
  }

  setCountryCodeValidator(phoneRequired, _phoneNoLabel) {
    if (phoneRequired && _phoneNoLabel && _phoneNoLabel === 1) {
      return [Validators.required, EmptyValueValidator];
    } else {
      return '';
    }
  }

  makeFormDirty() {
    this.FormGrp.markAsDirty();
  }

  addPhoneItem(i, _phoneNoLabel: any, _countryCode: any, _phoneNoDetails: any, _phoneIsPrivate: any, _phoneIsPrimary: any, extension: any = ''): void {
    this.Phone = this.FormGrp.get('Phone') as FormArray;
    // let extensionNo = extension == '' ? '' : ('+' + extension)
    this.Phone.push(this.createPhoneItem(i, _phoneNoLabel, _countryCode, _phoneNoDetails, _phoneIsPrivate, _phoneIsPrimary, extension));
    this.currentIndexPhone = i + 1;
    // this.FormGrp.get('Phone')[0].push((this.createPhoneItem(i, _phoneNoLabel, _phoneNoDetails, _phoneIsPrivate, _phoneIsPrimary, extension)));

  }

  togglePrimaryContact(formArrayName: string, formGroupName: any, formControlName: any) {
    let arr = this.FormGrp.get(formArrayName) as FormArray;
    let ctrls = arr.controls.filter((x, idx) => idx != formGroupName);
    ctrls.forEach(x => {
      let grp = x as FormGroup;
      grp.controls[formControlName].setValue(false);
    });
  }


  //enabling the extension only if the selected value is 'Office'
  enableExtension(index: number): boolean {
    let phoneControlsArr: any = this.FormGrp.get('Phone') as FormArray;
    let phoneNoSelectedValue: any = phoneControlsArr.at(index).controls['PhoneNumberLabel'].value
    let officeDesc: string = '';
    if (phoneNoSelectedValue) {
      let officeNo = this.contactTypePhone.find(d => d.id == phoneNoSelectedValue);
      officeDesc = officeNo ? officeNo.description : '';
    }
    return (this.localization.captions.common.Work.toLowerCase() == officeDesc.toLowerCase())
  }

  ngOnInit() {
    this.initializeFormData();
    if(this.parentForm){
      this.parentForm.addControl('personalDetailsFormGroup', this.FormGrp);
    }
  }

  initializeFormData() {
    this.textmaskFormat = this.localization.captions.common.PhoneFormat != '' ? this.localization.captions.common.PhoneFormat : '999999999999999999';
    this.makeGetCall('GetClientConfiguration');
    this.contactTypePhone = this.getPhoneOptions();
    this.contactTypeEmail = this.getMailOptions();
    this.validateEmailType = this.localization.getError(-87);
    this.validatePhoneType = this.localization.getError(-88);
    // this.appointmentService.isClientViewOnly = false;
    // this.appointmentService.isPreferenceViewOnly = false;
    // this.appointmentService.isSoapNotesViewOnly = false;
    // this.appointmentService.isClientImgRemoved = false;

    // if (this.appointmentService.clientEditData && this.appointmentService.clientWidowActionType == 'EDIT') {
    //   this.appointmentService.clientImageObj.pipe(takeUntil(this.destroyed$)).subscribe(x => {
    //     this.imageObj = x;
    //     if (this.imageObj && this.imageObj.length > 0 && this.appointmentService.guestId == this.imageObj[0].imageReferenceId) {
    //       // this.bindImage(this.imageObj[0].contentType, this.imageObj[0].data);
    //       if (this.imageObj[0].contentType.includes('base64')) {
    //         this.url = `${this.imageObj[0].contentType},${this.imageObj[0].data}`;
    //       } else {
    //         this.url = `data:${this.imageObj[0].contentType};base64,${this.imageObj[0].data}`;
    //       }
    //       this.editImageId = this.imageObj[0].id;
    //     }
    //   });
    //   this.appointmentService.clientScreenBreakPoints = this.BP.GetBreakPoint([SPAManagementBreakPoint.EditClientProfile, SPAManagementBreakPoint.EditClientPreferences, SPAManagementBreakPoint.EditSOAPNotes]).result
    //   this.appointmentService.isClientViewOnly = this.appointmentService.clientScreenBreakPoints ? this.appointmentService.clientScreenBreakPoints.filter(x => x.breakPointNumber == SPAManagementBreakPoint.EditClientProfile)[0].view : false;
    //   this.appointmentService.isPreferenceViewOnly = this.appointmentService.clientScreenBreakPoints ? this.appointmentService.clientScreenBreakPoints.filter(x => x.breakPointNumber == SPAManagementBreakPoint.EditClientPreferences)[0].view : false;
    //   this.appointmentService.isSoapNotesViewOnly = this.appointmentService.clientScreenBreakPoints ? this.appointmentService.clientScreenBreakPoints.filter(x => x.breakPointNumber == SPAManagementBreakPoint.EditSOAPNotes)[0].view : false;
    //   this.IsEdit = true;
    //   this.SetEditValues();
    //   if (this.appointmentService.isClientViewOnly) {
    //     this.utils.disableControls(this.FormGrp);
    //   }
    // }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    // this.appointmentService.convertToEditClient(null);
  }

  Validation(clientConfiguration: any) {
    clientConfiguration = clientConfiguration ? clientConfiguration : [];
    if (clientConfiguration && clientConfiguration.length == 0) return;

    this.FormGrp.controls['firstName'].clearValidators()
    this.FormGrp.controls['firstName'].setValidators(clientConfiguration[0]['CLIENT_FIRST_NAME'] ? [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['firstName'].updateValueAndValidity();

    this.FormGrp.controls['lastName'].clearValidators()
    this.FormGrp.controls['lastName'].setValidators(clientConfiguration[0]['CLIENT_LAST_NAME'] ? [Validators.required, EmptyValueValidator] : []);
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
    this.FormGrp.controls['country'].setValidators(clientConfiguration[0]['CLIENT_COUNTRY'] ? [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['country'].updateValueAndValidity();

    this.FormGrp.controls['postal_code'].clearValidators();
    this.FormGrp.controls['postal_code'].setValidators(clientConfiguration[0]['CLIENT_POSTAL_CODE'] ? [Validators.required, EmptyValueValidator] : []);
    this.FormGrp.controls['postal_code'].updateValueAndValidity();


    this.FormGrp.controls['dob'].clearValidators()
    this.FormGrp.controls['dob'].setValidators(clientConfiguration[0]['CLIENT_BIRTHDAY'] ? [Validators.required] : []);
    this.FormGrp.controls['dob'].updateValueAndValidity();



    this.emailRequired = clientConfiguration[0]['CLIENT_EMAIL'];
    this.phoneRequired = clientConfiguration[0]['CLIENT_PHONE'];
    this.AddressRequired = clientConfiguration[0]['CLIENT_ADDRESS_LINE_1'];


    let EmailArray = this.FormGrp.get('Email') as FormArray;
    EmailArray.controls.forEach(function (control) {
      let EmailGroup: FormGroup;
      EmailGroup = <FormGroup>control;
      EmailGroup.controls['EmailId'].clearValidators();
      EmailGroup.controls['EmailId'].setValidators(clientConfiguration[0]['CLIENT_EMAIL'] ? [Validators.required, EmptyValueValidator] : []);
      EmailGroup.controls['EmailId'].updateValueAndValidity();
    });
    let PhoneArray = this.FormGrp.get('Phone') as FormArray;
    let that = this;
    PhoneArray.controls.forEach(function (control, index) {
      let PhoneGroup: FormGroup;
      PhoneGroup = <FormGroup>control;

      PhoneGroup.controls['countryCode'].clearValidators();
      PhoneGroup.controls['countryCode'].setValidators(clientConfiguration[0]['CLIENT_PHONE'] ? [Validators.required, EmptyValueValidator] : []);
      that.setmandatory('event', 'PhoneNumber', 'countryCode', 'PhoneNumberLabel', index);
      PhoneGroup.controls['countryCode'].updateValueAndValidity();

      PhoneGroup.controls['PhoneNumber'].clearValidators();
      PhoneGroup.controls['PhoneNumber'].setValidators(clientConfiguration[0]['CLIENT_PHONE'] ? [Validators.required, EmptyValueValidator] : []);
      PhoneGroup.controls['PhoneNumber'].updateValueAndValidity();
    });
    let AddresArray = this.FormGrp.get('Address') as FormArray;
    AddresArray.controls.forEach(function (control) {
      let AddressGroup: FormGroup;
      AddressGroup = <FormGroup>control;
      AddressGroup.controls['addressLine'].clearValidators();
      AddressGroup.controls['addressLine'].setValidators(clientConfiguration[0]['CLIENT_ADDRESS_LINE_1'] ? [Validators.required, EmptyValueValidator] : []);
      AddressGroup.controls['addressLine'].updateValueAndValidity();
    });

    this.FormGrp.updateValueAndValidity();
  }


  PostalCodeChanged(e, IsAutoComplete) {

    let inputPin = this.FormGrp.controls['postal_code'].value;
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
      this.updateAddressField(res.address_components, true, index)
      if (!res.status) {
        this.googleAutoCompleteAddressLineBinding(index);
      }
      return;
    }
    if (res.status == 'OK') {
      if (IsAutoComplete) {
        let result: any = res;
        this.updateAddressField(res.address_components, true, index)
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
    //google auto complete from search
    let addressFormArr = this.FormGrp.get('Address') as FormArray;
    //populating auto completed value from text box(work around for angular issue)
    let addressCtl: any = document.getElementById('AddressInput' + index);
    let addressAutoPopulated: string = addressCtl.value;
    addressFormArr.at(index).patchValue({ 'addressLine': addressAutoPopulated });
    let ctrl: any = addressFormArr.at(index)
    ctrl.controls.addressLine.setErrors(null);
  }

  updateAddressField(add: Addresscomponent[], IsAutoComplete: boolean, index?: number) {
    let country: string = '';
    let state: string = '';
    let city: string = '';
    let googlePostalCode: string;
    if (add) {
      let addressFormArr = this.FormGrp.get('Address') as FormArray;
      addressFormArr.at(0).patchValue({ 'addressLine': ((add[0] && add[0].long_name) ? add[0].long_name.toString() : '') + ' ' + ((add[1] && add[1].long_name) ? add[1].long_name.toString() : '') });
      let ctrl: any = addressFormArr.at(index)
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


  placeNotfound: boolean;
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
        this.clientConfiguration = <any>result.result;
        this.Validation(this.clientConfiguration);
        break;
      case 'getImagesByReference': {
        let imageDetails = result.result;
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
    let addressArr: AddressComponent[] = [];
    let _line1: string = '';
    let _line2: string = '';
    let _line3: string = '';
    let _state: string = '';
    let _country: string = '';
    let _zip: string = '';

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

    // this.appointmentService.personalDetailAddress = {
    //   ContactTypeId: 1,
    //   ClientId: 0,
    //   Line1: _line1,
    //   Line2: _line2,
    //   Line3: _line3,
    //   State: _state,
    //   City: _country,
    //   Country: _country,
    //   Zip: _zip,
    //   IsPrivate: false
    // };
    this.FormGrp.controls['pincode'].setValue(_zip);

  }

  @ViewChild('placesRef', { static: false }) placesRef: GooglePlaceDirective;

  public handleAddressChange(address: Address) {
    // Do some stuff
  }

  async SetEditValues() {
    // let loyalty = this.appointmentService.clientEditData.clientDetail.loyaltyDetail[0];
    // let isCMSDataChanged: boolean = false;
    // if (loyalty && loyalty.patronId && this.isCMSConfigured) {
    //   isCMSDataChanged = await this.appointmentService.UpdateCMSDetailOnExistingGuest(loyalty.patronId, this.appointmentService.clientEditData, this.searchPatronCallBack.bind(this));
    //   loyalty = this.appointmentService.clientEditData.clientDetail.loyaltyDetail[0];
    //   if (!loyalty) {
    //     this.isPatronIdAvailable = false;
    //     this.FormGrp.controls.patronid.markAsDirty();
    //   }
    //   else {
    //     this.isPatronIdAvailable = true;
    //     this.FormGrp.reset();
    //   }
    //   isCMSDataChanged ? this.FormGrp.markAsDirty() : '';
    // }
    // else {
    //   this.isPatronIdAvailable = false;
    // }
    // this.personalDetails = this.appointmentService.clientEditData.clientDetail;
    // this.FormGrp.controls.title.setValue(this.utils.GetGuestIdbyTitle(this.appointmentService.clientEditData.clientDetail.title));
    // this.FormGrp.controls.firstName.setValue(this.appointmentService.clientEditData.clientDetail.firstName);
    // this.FormGrp.controls.lastName.setValue(this.appointmentService.clientEditData.clientDetail.lastName);
    // this.FormGrp.controls.pronounced.setValue(this.appointmentService.clientEditData.clientDetail.pronounce);
    // this.FormGrp.controls.gender.setValue(this.appointmentService.clientEditData.clientDetail.gender);
    // this.FormGrp.controls.dob.setValue(
    //   this.appointmentService.clientEditData.clientDetail.dateOfBirth ?
    //     this.utils.getDate(this.appointmentService.clientEditData.clientDetail.dateOfBirth)
    //     : ""
    // );

    // this.FormGrp.controls.patronid.setValue(loyalty ? loyalty.patronId : '');
    // this.FormGrp.controls.rank.setValue(loyalty ? loyalty.rank : '');
    // if (this.appointmentService.clientEditData.addresses && this.appointmentService.clientEditData.addresses.length > 0) {
    //   this.FormGrp.controls.postal_code.setValue(this.appointmentService.clientEditData.addresses[0].zip);
    //   this.FormGrp.controls.state.setValue(this.appointmentService.clientEditData.addresses[0].state);
    //   this.FormGrp.controls.city.setValue(this.appointmentService.clientEditData.addresses[0].city);
    //   this.FormGrp.controls.country.setValue(this.appointmentService.clientEditData.addresses[0].country);
    //   // this.FormGrp.controls.privateAddress.setValue(this.appointmentService.clientEditData.addresses[0].isPrivate);
    // }

    // // this.FormGrp.controls.PhoneNumber.setValue(this.appointmentService.clientEditData.phoneNumbers[0].number);
    // if (this.appointmentService.clientEditData.phoneNumbers && this.appointmentService.clientEditData.phoneNumbers.length > 0) {
    //   this.appointmentService.clientEditData.phoneNumbers.forEach((element, i) => {
    //     let _extension = element.extension ? element.extension : ''
    //     let _countryCode = element.countryCode ? element.countryCode : ''
    //     if (element.number != '') {
    //       if (element.contactTypeId === 3) { //Added For Extension when contact type is work
    //         if (element.number.indexOf(':') !== -1) {
    //           const arr = element.number.split(':');
    //           element.number = arr.length > 1 ? arr[1] : element.number;
    //           _extension = arr[0] ? arr[0] : '';
    //         } else {
    //           _extension = '';
    //         }
    //       }

    //       if (element.number.indexOf('|') !== -1) {
    //         const phonenum = element.number.split('|');
    //         element.number = phonenum[1];
    //         _countryCode = phonenum[0];
    //       }
    //     }
    //     this.addPhoneItem(i, element.contactTypeId, _countryCode, this.utils.appendFormat(element.number, this.localization.captions.common.PhoneFormat), element.isPrivate, element.isPrimary, _extension);
    //   });
    //   this.Phone.removeAt(0);
    // }

    // if (this.appointmentService.clientEditData.emails && this.appointmentService.clientEditData.emails.length > 0) {
    //   this.appointmentService.clientEditData.emails.forEach((element, i) => {
    //     this.addEmailItem(i, element.contactTypeId, element.emailId, element.isPrivate, element.isPrimary);
    //   });
    //   this.Email.removeAt(0);
    // }

    // if (this.appointmentService.clientEditData.addresses && this.appointmentService.clientEditData.addresses.length > 0) {
    //   let addressItem = this.appointmentService.clientEditData.addresses[0];
    //   //this.addAddressItem(element);
    //   if (addressItem.line1) {
    //     this.addAddressItem(0, addressItem.line1, addressItem.isPrivate)
    //     this.Address = this.FormGrp.get('Address') as FormArray;
    //     this.Address.removeAt(0);
    //   }
    //   if (addressItem.line2) {
    //     this.addAddressItem(1, addressItem.line2, addressItem.isPrivate)
    //   }
    //   if (addressItem.line3) {
    //     this.addAddressItem(2, addressItem.line3, addressItem.isPrivate)
    //   }

    // }
  }

  onFileDelete(event) {
    // this.appointmentService.isClientImgRemoved = this.IsEdit;
    this.ImageUploaded = false;
    this.makeFormDirty();
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    const file = event.target.files[0];
    // convert to MB
    const fileSize = file.size / (1024 * 1024);
    // Allow upload if size is lesser than or equal to 2 MB
    if (fileSize <= 2) {
      this.ImageUploaded = true;
      // this.appointmentService.isClientImgRemoved = false;
      const reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
      this.makeFormDirty();
    } else {
      this.utils.ShowError(this.localization.captions.common.Error, this.localization.captions.common.FileSizeExceeded);
    }

  }

  base64textString: any;
  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
    let imageObj: ImageData;
    if (this.imageObj && this.imageObj.length > 0) {
      imageObj = _.clone(this.imageObj[0]);
      imageObj.data = this.base64textString;
      imageObj.thumbnailData = this.base64textString;
      imageObj.contentType = this.selectedFile.type;
    }
    else {
      imageObj = {
        referenceId: 0,
        referenceType: ImgRefType.client,
        data: this.base64textString,
        id: 0,
        thumbnailData: this.base64textString,
        contentType: this.selectedFile.type,
        sequenceNo: 0
      }
    }
    // this.appointmentService.ImgTempHolder = imageObj;
    this.bindImage(this.selectedFile.type, this.base64textString)
  }

  private bindImage(fileContentType, fileContent) {
    if (fileContentType && fileContent) {
      // this.appointmentService.clientImageUrl = `data:${fileContentType};base64,${fileContent}`;
      // this.url = this.domSanitizer.bypassSecurityTrustUrl(this.appointmentService.clientImageUrl);
      this.ImageUploaded = true;
    }
  }

  fileDeleted() {
    // this.appointmentService.isClientImgRemoved = this.IsEdit;
    this.ImageUploaded = false;
    this.FormGrp.markAsDirty();
  }
  fileUploaded(data) {
    this.base64textString = data['orgImg'];
    this.thumbnailImg = data['tmbImg'];
    const base64result = this.base64textString.split(',');
    const base64Thumbnail = this.thumbnailImg.split(',');
    let imageObj: ImageData;
    if (this.imageObj && this.imageObj.length > 0) {
      imageObj = _.clone(this.imageObj[0]);
      imageObj.data = base64result[1];
      imageObj.thumbnailData = base64Thumbnail[1];
      imageObj.contentType = base64result[0];
    } else {
      imageObj = {
        referenceId: 0,
        referenceType: ImgRefType.client,
        data: base64result[1],
        id: 0,
        thumbnailData: base64Thumbnail[1],
        contentType: base64result[0],
        sequenceNo: 0
      };
    }
    // this.appointmentService.ImgTempHolder = imageObj;
    this.FormGrp.markAsDirty();
  }
  fileSizeExceeded() {
    this.utils.ShowError(this.captions.common.FileSizeExceeded, this.captions.common.Error, this.captions.common.Error);
  }

  emailChange(emailid, emailLabel, index) {

    if (this.FormGrp.controls['Email']['controls'][index].controls[emailid].value && !this.FormGrp.controls['Email']['controls'][index].controls[emailLabel].value) {

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
      if (this.FormGrp.controls['Phone']['controls'][index].controls[phoneType].value && this.FormGrp.controls['Phone']['controls'][index].controls[phoneType].value === 1) {
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
    if (this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumber].value && !this.FormGrp.controls['Phone']['controls'][index].controls[phoneNumberLabel].value) {

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
    let patronId = this.FormGrp.controls.patronid.value;
    if (patronId && patronId != '' && this.isCMSConfigured) {
      // this.appointmentService.searchClientByPatron(patronId, this.searchPatronCallBack.bind(this));
    }
  }

  searchPatronCallBack(result: number, extraParams?: any) {
    if (result == PatronInfoSearchResultType.EDITEXISTINGPATRON) {
      this.isPatronIdAvailable = true;
      this.initializeFormData();
    }
    else if (result == PatronInfoSearchResultType.PATRONNOTFOUND) {
      this.isPatronIdAvailable = false;
      this.FormGrp.controls.patronid.setValue('');
      this.FormGrp.controls.patronid.markAsDirty();
    }
    else if (result == PatronInfoSearchResultType.PATRONFOUND) {
      this.isPatronIdAvailable = true;
    }
    else if (result == PatronInfoSearchResultType.UPDATECMSDATAONEXISTING) {
      this.FormGrp.controls.firstName.setValue(extraParams[0].firstName);
      this.FormGrp.controls.lastName.setValue(extraParams[0].lastName);
      this.FormGrp.controls.pronounced.setValue(extraParams[0].pronounced);
      this.FormGrp.controls.rank.setValue(extraParams[0].playerRank);
      this.FormGrp.controls.dob.setValue(this.utils.getDate(extraParams[0].dateOfBirth));
      this.FormGrp.controls.gender.setValue(extraParams[0].gender == 'M' ? 'Male' : extraParams[0].gender == 'F' ? 'Female' : '')
      if (extraParams[0].address) {
        this.addAddressItem(0, extraParams[0].address.addressLine1, false)
        this.FormGrp.controls.postal_code.setValue(extraParams[0].address.postalCode);
        this.FormGrp.controls.state.setValue(extraParams[0].address.state);
        this.FormGrp.controls.city.setValue(extraParams[0].address.city);
        this.FormGrp.controls.country.setValue(extraParams[0].address.country);
        this.Address.removeAt(0);
      }
      if (extraParams[0].phone && extraParams[0].phone.length > 0) {
        extraParams[0].phone.forEach((element, i) => {
          this.addPhoneItem(i, element.phoneTypeId, element.countryCode, this.utils.appendFormat(element.phoneNumber, this.localization.captions.common.PhoneFormat), false, element.isPrimary, element.extension);
        });
        this.Phone.removeAt(0);
      }
      if (extraParams[0].email && extraParams[0].email.length > 0) {
        extraParams[0].email.forEach((element, i) => {
          this.addEmailItem(i, element.emailTypeId, element.emailAddress, false, false);
        });
        this.Email.removeAt(0)
      }
      this.isPatronIdAvailable = true;
    }
    this.clearPatronValidationError()
  }

  checkPatronValidation() {
    let patronValue = this.FormGrp.controls.patronid.value;
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


}


