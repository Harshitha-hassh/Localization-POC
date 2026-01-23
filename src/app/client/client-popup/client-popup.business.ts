import { Injectable } from '@angular/core';
import { LoyaltyDetail, Client, ClientInfo, Address, Email, PhoneNumber, ClientComment, GuestIdentityDetail } from './create-client/client.modal';
import { ClientDataService } from 'src/app/shared/data-services/client.data.service';
import { DefaultGUID } from 'src/app/retail/shared/globalsContant';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { GuestDataPolicyDataService } from 'src/app/common/dataservices/guest-datapolicy.data.service';
import { ApplyPolicy } from 'src/app/common/consent-management/consent-management.model';
import { GuestIdentityTypes, PassportType } from 'src/app/common/shared/shared/enums/enums';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';

@Injectable()
export class CreateClientBusiness {

  personalDetailsControls: any;
  additionalDetailsFormGroup: any;
  isClientUpdate: boolean = false;

  constructor(
    private Utilities: RetailUtilities, public localization: RetailStandaloneLocalization,
    private _clientDataService: ClientDataService,
    private _guestPolicyService: GuestDataPolicyDataService,
    private retailLocalization: RetailLocalization
  ) { }

  async SubmitForm(details, handlerError: boolean) {
    this.isClientUpdate = details.personalDetailsFormGroup.guestId != DefaultGUID;
    var clientDetail = this.CreateUpdateClient(details, this.isClientUpdate)
    if (details.personalDetailsFormGroup.guestId != DefaultGUID)
      return this._clientDataService.UpdateClientDetails(clientDetail, handlerError);
    else
      return this._clientDataService.CreateClientDetails(clientDetail, handlerError);
  }

  CreateUpdateClient(details: any, isClientUpdate: boolean) {
    this.personalDetailsControls = details.personalDetailsFormGroup;
    this.additionalDetailsFormGroup = details.additionalDetailsFormGroup;

    let loyaltyDet: LoyaltyDetail = this.personalDetailsControls.patronid ? {
      patronId: this.personalDetailsControls.patronid,
      rank: this.personalDetailsControls.rank ? this.personalDetailsControls.rank : ''
    } : null;
    let loyaltyObj: LoyaltyDetail[] = loyaltyDet ? [loyaltyDet] : [];

    let clientComment : ClientComment = {
        id: this.additionalDetailsFormGroup.commentId,
        platformCommentUuid: this.additionalDetailsFormGroup.platformCommentUuid ? this.additionalDetailsFormGroup.platformCommentUuid : '00000000-0000-0000-0000-000000000000',
        platformRevisionUuid: this.additionalDetailsFormGroup.platformRevisionUuid ? this.additionalDetailsFormGroup.platformRevisionUuid : '00000000-0000-0000-0000-000000000000',
        comments: this.additionalDetailsFormGroup.comments ? this.additionalDetailsFormGroup.comments : '',
        platformGuestUuid: this.isClientUpdate ? details.personalDetailsFormGroup.platformGuestUuid : '00000000-0000-0000-0000-000000000000',
        productId: parseInt(this.Utilities.GetPropertyInfo('ProductId'))
    }
    let clientCommentObj: ClientComment[] = clientComment ? [clientComment] : [];
    let clientObj: Client = {
      id: isClientUpdate ? details.personalDetailsFormGroup.id : 0,
      guestId: isClientUpdate ? details.personalDetailsFormGroup.guestId : DefaultGUID,
      title: this.personalDetailsControls.title,
      firstName: this.Utilities.capitalizeFirstLetter(this.personalDetailsControls.firstName),
      lastName: this.Utilities.capitalizeFirstLetter(this.personalDetailsControls.lastName),
      pronounce: this.Utilities.capitalizeFirstLetter(this.personalDetailsControls.pronounced),
      gender: this.personalDetailsControls.gender,
      dateOfBirth:
        this.personalDetailsControls.dob == '' ? ''
          : this.Utilities.GetFormattedDate(this.personalDetailsControls.dob),
      comments: this.additionalDetailsFormGroup.comments ? this.additionalDetailsFormGroup.comments : '',
      lastChangeId: isClientUpdate ? details.personalDetailsFormGroup.lastChangeId : DefaultGUID,
      interfaceGuestId: isClientUpdate ? details.personalDetailsFormGroup.interfaceGuestId : '',
      loyaltyDetail: loyaltyObj,
      clientCategoryId: 1,
      consent: new Date(),
      consentExpiryDate: new Date(),
      consentPolicyId: 0,
      isPurged: false,
      policyComments: "",
      vip: this.additionalDetailsFormGroup.vip ? this.additionalDetailsFormGroup.vip : '',
      vipTypeId: this.additionalDetailsFormGroup.vipTypeId ? this.additionalDetailsFormGroup.vipTypeId : 0,
      guestType: this.additionalDetailsFormGroup.guestType ? this.additionalDetailsFormGroup.guestType : 0,
      platformBussinessCardRevUuid: isClientUpdate ? details.personalDetailsFormGroup.platformBussinessCardRevUuid : '',
      platformBussinessCardUuid: isClientUpdate ? details.personalDetailsFormGroup.platformBussinessCardUuid : '',
      platformGuestUuid: isClientUpdate ? details.personalDetailsFormGroup.platformGuestUuid : '',
      platformRevUuid: isClientUpdate ? details.personalDetailsFormGroup.platformRevUuid : '',
      anniversaryDate: this.additionalDetailsFormGroup.anniversaryDate ? this.Utilities.GetFormattedDate(this.additionalDetailsFormGroup.anniversaryDate) : '',
      preferredLanguage: this.additionalDetailsFormGroup.preferredLanguage ? this.additionalDetailsFormGroup.preferredLanguage : 0,
      nationality: this.personalDetailsControls.nationality?.name ? this.personalDetailsControls.nationality.name : '',
      placeOfBirth: this.additionalDetailsFormGroup.placeOfBirth || '',
      guestIdentityDetails: this.mapIdentificationDetails(details.identificationDetailsFormGroup)
    };

    let clientInfoObj: ClientInfo = {
      id: isClientUpdate ? details.personalDetailsFormGroup.id : 0,
      client: clientObj,
      emails: this.formEmailObj(),
      addresses: this.formAddressObject(),
      phoneNumbers: this.formPhoneObject(),
      clientCreditCardInfo: this.additionalDetailsFormGroup.clientCreditCardInfo
        && this.additionalDetailsFormGroup.clientCreditCardInfo.length > 0 ?
        this.additionalDetailsFormGroup.clientCreditCardInfo : null,
        clientComment: clientCommentObj,
        guestTypeCategories: details.philippinesGuestTypeCategories || []
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
        _Number += element.countryCode ? element.countryCode + "|" + phoneNumber : phoneNumber;
        let phoneObj: PhoneNumber = {
          clientId: this.isClientUpdate ? this.personalDetailsControls.id : 0,
          contactTypeId: element.PhoneNumberLabel ? element.PhoneNumberLabel : 0,
          number: _Number,
          extension: element.Extension ? element.Extension.replace('+', '') : '',
          isPrivate: element.PhonePrivate ? element.PhonePrivate : false,
          isPrimary: element.PhonePrimary ? element.PhonePrimary : false,
          platformContactUuid: element.PlatformContactUuid ? element.PlatformContactUuid : ''
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
      if (element.EmailId && element.EmailId != '') {
        let emailObj: Email = {
          clientId: this.isClientUpdate ? this.personalDetailsControls.id : 0,
          contactTypeId: (element.EmailLabel) ? (element.EmailLabel) : 0,
          emailId: element.EmailId,
          isPrivate: element.EmailPrivate ? element.EmailPrivate : false,
          isPrimary: element.EmailPrimary ? element.EmailPrimary : false,
          platformContactUuid: element.PlatformContactUuid ? element.PlatformContactUuid : ''
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
      clientId: this.isClientUpdate ? this.personalDetailsControls.id : 0,
      contactTypeId: 1,
      addressLine1: _line1 ? _line1 : '',
      addressLine2: _line2 ? _line2 : '',
      addressLine3: _line3 ? _line3 : '',
      state: this.personalDetailsControls.state ? this.personalDetailsControls.state : '',
      city: this.personalDetailsControls.city ? this.personalDetailsControls.city : '',
      country: this.personalDetailsControls.country ? this.personalDetailsControls.country : '',
      county: this.personalDetailsControls.county ? this.personalDetailsControls.county : '',
      zip: this.personalDetailsControls.postal_code ? this.personalDetailsControls.postal_code : '',
      zipCode: this.personalDetailsControls.postal_code ? this.personalDetailsControls.postal_code : '',
      isPrivate: isPrivate,
      platformAddressUuid: this.personalDetailsControls.platformAddressUuid ? this.personalDetailsControls.platformAddressUuid : '',
    }
    return addrObj;
  }

  async searchClientByPatron(patronId: string) {
    return await this._clientDataService.searchClientByPatron(patronId);
  }

  async getIsGdprConfiguredFlag(): Promise<boolean> {
    var tenantId = Number(this.Utilities.GetPropertyInfo("TenantId"));
    var isGdprConfigured = await this._guestPolicyService.GetDataRetentionPolicyConfiguredFlag(tenantId);
    return isGdprConfigured;
  }
  async getPolicyTypeUsingPolicyId(policyId: number): Promise<number> {
    var policyType = await this._guestPolicyService.GetPolicyTypeUsingPolicyId(policyId);
    return policyType;
  }
  async updatePolicyDetailsForGuestId(applyPolicy: ApplyPolicy): Promise<boolean> {
    const result = await this._clientDataService.updatePolicyDetailsForGuestId(applyPolicy);
    return result;
  }

  getGuestIdentityTypes(): any[] {
    const captions = this.retailLocalization?.captions?.identificationDetails;
    if (!captions) {
      return [];
    }
    return [
      { id: GuestIdentityTypes.SocialSecurityNumber, value: GuestIdentityTypes.SocialSecurityNumber, viewValue: captions.SocialSecurityNumber },
      { id: GuestIdentityTypes.PassportNumber, value: GuestIdentityTypes.PassportNumber, viewValue: captions.Passport },
      { id: GuestIdentityTypes.DriversLicense, value: GuestIdentityTypes.DriversLicense, viewValue: captions.DriversLicense },
      { id: GuestIdentityTypes.NationalID, value: GuestIdentityTypes.NationalID, viewValue: captions.NationalID },
      { id: GuestIdentityTypes.Others, value: GuestIdentityTypes.Others, viewValue: captions.Others }
    ];
  }

  getPassportTypes(): any[] {
    const captions = this.retailLocalization?.captions?.identificationDetails;
    if (!captions) {
      return [];
    }
    return [
      { id: PassportType.Ordinary, value: PassportType.Ordinary, viewValue: captions.Ordinary },
      { id: PassportType.Diplomatic, value: PassportType.Diplomatic, viewValue: captions.Diplomatic }
    ];
  }

  mapIdentificationDetails(formValues: any): GuestIdentityDetail[] {
    const identificationDetails: GuestIdentityDetail[] = [];

    if (!formValues?.identificationDetails?.length) {
      return identificationDetails;
    }

    formValues.identificationDetails.forEach(element => {
      const typeControl = element.identificationTypeId;
      const typeId = typeof typeControl === 'object'
        ? (typeControl?.id ?? typeControl?.value ?? 0)
        : Number(typeControl ?? 0);

      // Only include entries with a valid identification type selected
      if (typeId > 0) {
        identificationDetails.push({
          id: element.id || 0,
          type: typeId,
          value: element.value?.trim() || '',
          issuingCountry: element.issuingCountry?.trim() || '',
          issuingLocation: element.issuingLocation?.trim() || '',
          identificationTypeOtherName: element.identificationTypeOtherName?.trim() || '',
          passportType: element.passportType || 0,
          issuedDate: element.issuedDate
            ? this.Utilities.GetFormattedDate(element.issuedDate)
            : null,
          expiryDate: element.expiryDate
            ? this.Utilities.GetFormattedDate(element.expiryDate)
            : null
        });
      }
    });

    return identificationDetails;
  }
}