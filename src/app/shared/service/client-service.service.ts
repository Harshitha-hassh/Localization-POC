import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseResponse } from '../business/shared.modals';
import { HttpServiceCall, HttpMethod } from './http-call.service';
import { Host, ButtonOptions, ButtonType } from '../globalsContant';
import { FormGroup, FormArray } from '@angular/forms';
import { AppointmentpopupService } from './appointmentpopup.service';
import { Appointment } from '../../appointment/appointment.component';
import { formatAMPMPipes } from '../../appointment/spa-appointment/spa-appointment.component';
import { Utilities } from '../utilities/utilities';
import { Localization } from '../../core/localization/Localization';
import { MatDialog } from '@angular/material';
import { appointmentService } from './appointment.service';



@Injectable()
export class ClientService implements OnDestroy {
  captions: any = this.localization.captions.bookAppointment;
  common : any = this.localization.captions.common;
  $destroyed: any;
  isVip:any = false;
  selectedIndex:any = 0;
  ngOnDestroy(): void {
    this.$destroyed.next(true);
    this.$destroyed.complete();
  }
  constructor(private http : HttpServiceCall, private appointmentpopservice:AppointmentpopupService,
    private Utilities: Utilities,
    public localization: Localization,public dialog: MatDialog,public appointmentServiceObject: appointmentService) { }

  async MandatoryFieldsValidation(clientData: any): Promise<boolean> {
    let result: any = await this.http.CallApiAsync({
      callDesc: 'GetClientConfiguration',
      host: Host.spaManagement,
      method: HttpMethod.Get
    });

    let clientConfigurations = result.result;

    let valid: boolean = true;
    if (clientConfigurations && clientConfigurations.length > 0) {
      let config: any = clientConfigurations[0];

      valid  = ((config.CLIENT_FIRST_NAME && !clientData.clientDetail.firstName ? false : true )
                &&
                (config.CLIENT_FIRST_NAME && !clientData.clientDetail.lastName ? false : true )
                &&
                (config.CLIENT_TITLE && !clientData.clientDetail.title ? false : true )
                &&
                (config.CLIENT_GENDER && !clientData.clientDetail.gender ? false : true )
                &&
                ((config.CLIENT_STATE && !(clientData.addresses && clientData.addresses.length > 0 && clientData.addresses[0].state)) ? false : true )
                &&
                ((config.CLIENT_CITY && !(clientData.addresses && clientData.addresses.length > 0 && clientData.addresses[0].city)) ? false : true )
                &&
                ((config.CLIENT_COUNTRY && !(clientData.addresses && clientData.addresses.length > 0 && clientData.addresses[0].country))? false : true )
                &&
                ((config.CLIENT_POSTAL_CODE  && !(clientData.addresses && clientData.addresses.length > 0 && clientData.addresses[0].zip)) ? false : true )
                &&
                (config.CLIENT_BIRTHDAY && !clientData.clientDetail.dateOfBirth ? false : true )
                &&
                ((config.CLIENT_EMAIL  && !(clientData.emails && clientData.emails.length > 0 && clientData.emails[0].emailId)) ? false : true )
                &&
                ((config.CLIENT_PHONE && !(clientData.phoneNumbers && clientData.phoneNumbers.length > 0 && clientData.phoneNumbers[0].number)) ? false : true )
                &&
                ((config.CLIENT_ADDRESS_LINE_1 && !(clientData.addresses && clientData.addresses.length > 0 && clientData.addresses[0].line1)) ? false : true )
                &&
                (config.CUSTOM_FIELD_1 && !clientData.clientDetail.customField1   ? false : true )
                &&
                (config.CUSTOM_FIELD_2 && !clientData.clientDetail.customField2   ? false : true )
                &&
                (config.CUSTOM_FIELD_3 && !clientData.clientDetail.customField3   ? false : true )
                &&
                (config.CUSTOM_FIELD_4 && !clientData.clientDetail.customField4   ? false : true )
                &&
                (config.CUSTOM_FIELD_5 && !clientData.clientDetail.customField5   ? false : true )
              )
    }

    return valid;
  }

  validateClientSave(): Boolean {
    if (!this.appointmentpopservice.personalDetailsFormGroup.valid) {
      if (!this.appointmentpopservice.isClientViewOnly) {
        //prevents tab change while in viewonly mode.
        this.appointmentpopservice.ClientSelectedTab = 0;
      }
      this.appointmentpopservice.personalDetailsFormGroup.controls['firstName'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['lastName'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['pronounced'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['dob'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['pincode'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['title'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['Email'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['Phone'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['Address'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['emailPrimary'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['phonePrimary'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['state'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['city'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['country'].markAsTouched();
      this.appointmentpopservice.personalDetailsFormGroup.controls['postal_code'].markAsTouched();
      // let phoneArr = this.appointmentpopservice.personalDetailsFormGroup.get('Phone') as FormArray;
      // let phoneElem: any = phoneArr.at(0);
      // phoneElem.controls.PhoneNumber.markAsTouched();
      // phoneElem.controls.PhoneNumberLabel.markAsTouched();
      // if(!phoneElem.controls['PhoneNumber'].valid && phoneElem.controls['PhoneNumberLabel'].value == "")
      // {
      //   phoneElem.controls['PhoneNumberLabel'].setErrors({'incorrect': true});
      // }
      // let emailArr = this.appointmentpopservice.personalDetailsFormGroup.get('Email') as FormArray;
      // let emailElem: any = emailArr.at(0);
      // emailElem.controls.EmailId.markAsTouched();
      // emailElem.controls.EmailLabel.markAsTouched();
      // if(!emailElem.controls['EmailId'].valid && emailElem.controls['EmailLabel'].value == "")
      // {
      //   emailElem.controls['EmailLabel'].setErrors({'incorrect': true});
      // }
      // let email = emailElem.controls['EmailId'].value;
      // if (!this.validateEmail(email)) {
      //   if (email.trim() != "") {
      //     emailElem.controls['EmailId'].setErrors({'incorrect': true});
      //     this.appointmentpopservice.personalDetailsFormGroup.setErrors({'incorrect': true});
      //   }
      // }
      this.validatePhoneAndEmail();
      let addressArray = this.appointmentpopservice.personalDetailsFormGroup.get('Address') as FormArray;
      let addrElem: any = addressArray.at(0);
      addrElem.controls.addressLine.markAsTouched();
      return false;
    }

    if (this.appointmentpopservice.personalDetailsFormGroup.valid && this.appointmentpopservice.ClientSelectedTab != 1 && !this.appointmentpopservice.additionalDetailsFormGroup.valid) {

      if(!this.isPhoneNumberValid())
      {
        return false;
      }
      if(!this.isEmailValide()){
        return false;
      }
      this.appointmentpopservice.additionalDetailsFormGroup.controls['card_details'].markAsTouched();
      this.appointmentpopservice.additionalDetailsFormGroup.controls['expiry_date'].markAsTouched();
      this.appointmentpopservice.additionalDetailsFormGroup.controls['customField1'].markAsTouched();
      this.appointmentpopservice.additionalDetailsFormGroup.controls['customField2'].markAsTouched();
      this.appointmentpopservice.additionalDetailsFormGroup.controls['customField3'].markAsTouched();
      this.appointmentpopservice.additionalDetailsFormGroup.controls['customField4'].markAsTouched();
      this.appointmentpopservice.additionalDetailsFormGroup.controls['customField5'].markAsTouched();
      this.appointmentpopservice.additionalDetailsFormGroup.controls['comments'].markAsTouched();
      setTimeout(() => this.appointmentpopservice.ClientSelectedTab = 1, 500);
      return false;
    }

    // if(!this.isPhoneNumberValid())
    // {
    //   return false;
    // }
    // if(!this.isEmailValide()){
    //   return false;
    // }
    this.validatePhoneAndEmail();

    return true;
  }

  isPhoneNumberValid(){
    let phoneArr = this.appointmentpopservice.personalDetailsFormGroup.get('Phone') as FormArray;
    let phoneElem: any = phoneArr.at(0);
    phoneElem.controls.PhoneNumber.markAsTouched();
    phoneElem.controls.PhoneNumberLabel.markAsTouched();
    if(!this.validatePhone(phoneElem.controls['PhoneNumber'].value))
    {
      phoneElem.controls['PhoneNumber'].setErrors({'incorrect': true});
      return false;
    }
    return true;
  }

  isEmailValide(){
    let emailArr = this.appointmentpopservice.personalDetailsFormGroup.get('Email') as FormArray;
    let emailElem: any = emailArr.at(0);
    let email = emailElem.controls['EmailId'].value;
    if(!emailElem.controls['EmailId'].valid && emailElem.controls['EmailLabel'].value == "")
    {
      emailElem.controls['EmailLabel'].setErrors({'incorrect': true});
    }
    if (!this.validateEmail(email)) {
      if (email.trim() != "") {
        emailElem.controls['EmailId'].setErrors({'incorrect': true});
        this.appointmentpopservice.personalDetailsFormGroup.setErrors({'incorrect': true});
        return false;
      }
    }
    return true;
  }

  validatePhoneAndEmail()
  {
      if(this.appointmentpopservice.personalDetailsFormGroup.controls['Phone'].touched)
      {
        let phoneArr = this.appointmentpopservice.personalDetailsFormGroup.get('Phone') as FormArray;
        let phoneElem: any = phoneArr.at(0);
        phoneElem.controls.PhoneNumber.markAsTouched();
        phoneElem.controls.PhoneNumberLabel.markAsTouched();
        if(!phoneElem.controls['PhoneNumber'].valid && phoneElem.controls['PhoneNumberLabel'].value == "")
        {
          phoneElem.controls['PhoneNumberLabel'].setErrors({'incorrect': true});
        }
      }
      if(this.appointmentpopservice.personalDetailsFormGroup.controls['Email'].touched)
      {
        let emailArr = this.appointmentpopservice.personalDetailsFormGroup.get('Email') as FormArray;
        let emailElem: any = emailArr.at(0);
        emailElem.controls.EmailId.markAsTouched();
        emailElem.controls.EmailLabel.markAsTouched();
        if(!emailElem.controls['EmailId'].valid && emailElem.controls['EmailLabel'].value == "")
        {
          emailElem.controls['EmailLabel'].setErrors({'incorrect': true});
        }
        let email = emailElem.controls['EmailId'].value;
        if (!this.validateEmail(email)) {
          if (email.trim() != "") {
            emailElem.controls['EmailId'].setErrors({'incorrect': true});
            this.appointmentpopservice.personalDetailsFormGroup.setErrors({'incorrect': true});
          }
        }
      }
  }

  validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  validatePhone(phone: string): boolean
  {
    let result : boolean;
    if(phone == '')
    {
      result = true;
    }
    else
    {
      result = phone.length == this.common.PhoneFormat.length;
    }
    return result;
  }

  async checkClientMandatoryFields(): Promise<boolean> {
    let valid = true;
    if (this.appointmentpopservice.recordsArray && this.appointmentpopservice.recordsArray.length > 0) {
      for (let i = 0; i < this.appointmentpopservice.recordsArray.length; i++) {
        valid = await this.MandatoryFieldsValidation(this.appointmentpopservice.recordsArray[i]);
        if (!valid) {
          let extraParams = { "clientDetail": this.appointmentpopservice.recordsArray[i].clientDetail, "packageEdit": false , 'clientData' : this.appointmentpopservice.recordsArray[i] }
          this.Utilities.ShowError(this.captions.ErrorinCreatingAppointment, this.localization.replacePlaceholders(this.localization.getError(100005), ["clientName",], [this.appointmentpopservice.recordsArray[i].clientDetail.firstName.concat(' ', this.appointmentpopservice.recordsArray[i].clientDetail.lastName)]));
          return valid;
        }
      }
    }
    return valid;
  }
}

