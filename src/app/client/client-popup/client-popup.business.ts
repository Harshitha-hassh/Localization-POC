import { Injectable } from '@angular/core';
import { LoyaltyDetail, Client, ClientInfo, Address, Email, PhoneNumber } from './create-client/client.modal';
import { ClientDataService } from 'src/app/shared/data-services/client.data.service';
import { DefaultGUID } from 'src/app/retail/shared/globalsContant';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';

@Injectable()
export class CreateClientBusiness {

    personalDetailsControls :any;
    additionalDetailsFormGroup :any;
    isClientUpdate :boolean = false;

    constructor(
        private Utilities: RetailUtilities,  public localization: RetailStandaloneLocalization,
        private _clientDataService: ClientDataService
      ) {}
    
    async SubmitForm(details) {
        this.isClientUpdate = details.personalDetailsFormGroup.guestId != DefaultGUID;
        var clientDetail = this.CreateUpdateClient(details , this.isClientUpdate)
        if (details.personalDetailsFormGroup.guestId != DefaultGUID)
          return  this._clientDataService.UpdateClientDetails(clientDetail);
        else
          return this._clientDataService.CreateClientDetails(clientDetail);
      }
    
      CreateUpdateClient(details :any ,isClientUpdate: boolean){
      this.personalDetailsControls = details.personalDetailsFormGroup;
      this.additionalDetailsFormGroup= details.additionalDetailsFormGroup;

      let loyaltyDet: LoyaltyDetail = this.personalDetailsControls.patronid ? {
            patronId: this.personalDetailsControls.patronid,
            rank: this.personalDetailsControls.rank ? this.personalDetailsControls.rank : ''
          } : null;
      let loyaltyObj: LoyaltyDetail[] = loyaltyDet ? [loyaltyDet] : [];

      let clientObj: Client = {
        id: isClientUpdate ? details.personalDetailsFormGroup.id: 0, 
        guestId: isClientUpdate ? details.personalDetailsFormGroup.guestId : DefaultGUID,
        title: this.Utilities.GetGuestTitlebyId(Number(this.personalDetailsControls.title)),
        firstName: this.Utilities.capitalizeFirstLetter(this.personalDetailsControls.firstName),
        lastName: this.Utilities.capitalizeFirstLetter(this.personalDetailsControls.lastName),
        pronounce: this.Utilities.capitalizeFirstLetter(this.personalDetailsControls.pronounced),
        gender: this.personalDetailsControls.gender,
        dateOfBirth:
        this.personalDetailsControls.dob == '' ? ''
            : this.Utilities.GetFormattedDate(this.personalDetailsControls.dob),
        comments : this.additionalDetailsFormGroup.comments ? this.additionalDetailsFormGroup.comments : '',
        lastChangeId: isClientUpdate ?  details.personalDetailsFormGroup.lastChangeId: DefaultGUID,
        interfaceGuestId: isClientUpdate ?  details.personalDetailsFormGroup.interfaceGuestId : '',
        loyaltyDetail: loyaltyObj,
        ClientCategoryId: 1
      };

      let clientInfoObj: ClientInfo = {
        id: isClientUpdate ? details.personalDetailsFormGroup.id: 0,
        client: clientObj,
        emails: this.formEmailObj(),
        addresses: this.formAddressObject(),
        phoneNumbers: this.formPhoneObject(),
        clientCreditCardInfo: this.additionalDetailsFormGroup.clientCreditCardInfo
          && this.additionalDetailsFormGroup.clientCreditCardInfo.length > 0 ?
          this.additionalDetailsFormGroup.clientCreditCardInfo : null
      }
      return clientInfoObj;
    }

    formPhoneObject(): PhoneNumber[] {
        let clientPhoneObj: PhoneNumber[] = [];
        let phoneArr = this.personalDetailsControls.Phone;
        for (let i = 0; i < phoneArr.length; i++) {
          let _Number: string = '';
          const element = phoneArr[i];
          if (element.PhoneNumber && element.PhoneNumber != '') {
            const phoneNumber = (element.PhoneNumber).replace(/\D/g, '');
            //Added For Phone Number when contact type is work.
            if (element.PhoneNumberLabel == '3' && element.Extension != '') {
              _Number = element.Extension + ":";
            }
            _Number += element.countryCode ? element.countryCode + "|"  + phoneNumber : phoneNumber;
            let phoneObj: PhoneNumber = {
              clientId :this.isClientUpdate ? this.personalDetailsControls.id: 0,
              contactTypeId: element.PhoneNumberLabel ? element.PhoneNumberLabel : 0,
              number: _Number,
              extension: element.Extension ? element.Extension.replace('+', '') : '',
              isPrivate: element.PhonePrivate ? element.PhonePrivate : false,
              isPrimary: element.PhonePrimary ? element.PhonePrimary : false
            };
            clientPhoneObj.push(phoneObj);
          }
        }
        return clientPhoneObj;
      }
    
      formEmailObj(): Email[] {
        let emailObjArr: Email[] = [];
        let emailArr: any = this.personalDetailsControls.Email;
        for (let i = 0; i < emailArr.length; i++) {
          const element = emailArr[i];
          if (element.EmailId && element.EmailId!= '') {
            let emailObj: Email = {
              clientId: this.isClientUpdate ? this.personalDetailsControls.id: 0,
              contactTypeId: (element.EmailLabel) ? (element.EmailLabel) : 0,
              emailId: element.EmailId,
              isPrivate: element.EmailPrivate ? element.EmailPrivate : false,
              isPrimary: element.EmailPrimary ? element.EmailPrimary : false
            };
            emailObjArr.push(emailObj);
          }
        }
        return emailObjArr;
    }

    formAddressObject(): Address {
        let addObjarr: Address[] = [];
        let addressArr: any = this.personalDetailsControls.Address
        let _line1: string = '';
        let _line2: string = '';
        let _line3: string = '';
        let isPrivate: boolean;
    
        for (let i = 0; i < addressArr.length; i++) {
          const element = addressArr[i];
    
          if (i == 0) {
            _line1 = element.addressLine;
            isPrivate = element.privateAddress ? element.privateAddress : false 
          }
          if (i == 1) {
            _line2 = element.addressLine;
          }
          if (i == 2) {
            _line3 = element.addressLine;
          }
        }
    
        let addrObj: Address = {
          clientId :this.isClientUpdate ? this.personalDetailsControls.id: 0,
          contactTypeId: 1,
          addressLine1: _line1 ? _line1 : '',
          addressLine2: _line2 ? _line2 : '',
          addressLine3: _line3 ? _line3 : '',
          state: this.personalDetailsControls.state ? this.personalDetailsControls.state  : '',
          city: this.personalDetailsControls.city  ? this.personalDetailsControls.city  : '',
          country: this.personalDetailsControls.state  ? this.personalDetailsControls.state  : '',
          zip: this.personalDetailsControls.postal_code  ? this.personalDetailsControls.postal_code  : '',
          zipCode : this.personalDetailsControls.postal_code  ? this.personalDetailsControls.postal_code  : '',
          isPrivate: isPrivate
        }
        return addrObj;
      }
     
     async searchClientByPatron(patronId: string){
       return await this._clientDataService.searchClientByPatron(patronId);
     }

   
}