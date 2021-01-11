import { Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { FormatTextPipe } from 'src/app/shared/pipes/formatText-pipe.pipe';

@Component({
  selector: 'app-rendering-options',
  templateUrl: './rendering-options.component.html',
  styleUrls: ['./rendering.options.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RedenderingOptionComponent implements OnInit, OnChanges {
  @Input() datainput: any;
  @Input() groupvalue: any;
  @Input() searchText: any

  groupObj: any;
  groupObjVal: any;
  showPhoneNumber: boolean = false;
  showEmail: boolean = false;
  showAddress: boolean = false;
  address: string;
  email: string;
  phoneNumber: string;
  contactTypeEmail: any = [];
  contactTypePhone: any = [];
  showPatronId: boolean = false;
  patronId: string;
  constructor(public localization: RetailStandaloneLocalization, public formatphno: FormatTextPipe) { }


  ngOnChanges() {
    this.IsaddressMatching();
    this.IsContactTypeValueMatching();
    this.IsPatronInfoMatching();
    this.groupObj = this.datainput;
    this.groupObjVal = this.groupvalue;
  }
  ngOnInit() {
  }

  IsaddressMatching() {
    if (this.datainput.address && this.datainput.address.length > 0 && this.searchText) {
      let address = this.datainput.address[0];
      let searchTextLower = this.searchText.toLowerCase();
      this.showAddress = (
        (address.addressLine1 || '').toLowerCase().indexOf(searchTextLower) >= 0 || 
        (address.addressLine2 || '').toLowerCase().indexOf(searchTextLower) >= 0 ||
        (address.addressLine3 || '').toLowerCase().indexOf(searchTextLower) >= 0 ||
        (address.city || '').toLowerCase().indexOf(searchTextLower) >= 0 ||
        (address.state || '').toLowerCase().indexOf(searchTextLower) >= 0 ||
        (address.country || '').toLowerCase().indexOf(searchTextLower) >= 0 ||
        (address.county || '').toLowerCase().indexOf(searchTextLower) >= 0 ||
        (address.zipCode || '').toLowerCase().indexOf(searchTextLower) >= 0)
      if (this.showAddress) {
        let addressArray = new Array();
        if (address.addressLine1 && address.addressLine1 != null && address.addressLine1.trim() != "") {
          addressArray.push(address.addressLine1);
        }
        if (address.addressLine2 && address.addressLine2 != null && address.addressLine2.trim() != "") {
          addressArray.push(address.addressLine2);
        }
        if (address.addressLine3 && address.addressLine3 != null && address.addressLine3.trim() != "") {
          addressArray.push(address.addressLine3);
        }
        if (address.city && address.city != null && address.city.trim() != "") {
          addressArray.push(address.city);
        }
        if (address.state && address.state != null && address.state.trim() != "") {
          addressArray.push(address.state);
        }
        if (address.country && address.country != null && address.country.trim() != "") {
          addressArray.push(address.country);
        }
        if (address.county && address.county != null && address.county.trim() != "") {
          addressArray.push(address.county);
        }
        if (address.zipCode && address.zipCode != null && address.zipCode.trim() != "") {
          addressArray.push(address.zipCode);
        }
        this.address = addressArray.join();

      }
    }
    else {
      this.showAddress = false;
    }
  }

  IsContactTypeValueMatching() {
    if (this.datainput.contactDetail && this.datainput.contactDetail.length > 0) {
      this.contactTypePhone = this.localization.ContactTypes.Phone;
      this.contactTypeEmail = this.localization.ContactTypes.Email;

      let contactDetail = this.datainput.contactDetail;
      let matchingContactDetails = contactDetail.filter(x => x.value.toLowerCase().indexOf(this.searchText.toLowerCase()) >= 0)
      if (matchingContactDetails.length == 0) {
        this.showPhoneNumber = false;
        this.showEmail = false;
      }
      else {
        let phoneNumbersArray: string[] = ["Home", "Cell", "Work"];
        let phoneRecords = matchingContactDetails.filter(x => phoneNumbersArray.indexOf(x.name) >= 0);
        if (phoneRecords.length >= 1) {
          var sortedPhoneNumbersBasedOnIsPrimary = phoneRecords.sort(function (a, b) {
            return b.isPrimary - a.isPrimary
          })

          // this.phoneNumber = this.contactTypePhone.find(d => d.id == sortedPhoneNumbersBasedOnIsPrimary[0].type).description + " : " + this.formatphno.transform(sortedPhoneNumbersBasedOnIsPrimary[0].value, this.localization.captions.common.PhoneFormat);
          this.phoneNumber = this.getFormattedPhNo(sortedPhoneNumbersBasedOnIsPrimary[0]);
          this.showPhoneNumber = true;
          this.showEmail = false;
          this.showAddress = false;
        }
        else {
          let eMailTypesArray: string[] = ["Personal", "Office"];
          let eMailRecords = matchingContactDetails.filter(x => eMailTypesArray.indexOf(x.name) >= 0);
          if (eMailRecords.length >= 1) {
            var sortedeMailsBasedOnIsPrimary = eMailRecords.sort(function (a, b) {
              return b.isPrimary - a.isPrimary
            })
            this.email = this.contactTypeEmail.find(d => d.id == sortedeMailsBasedOnIsPrimary[0].type).description + " : " + sortedeMailsBasedOnIsPrimary[0].value
            this.showPhoneNumber = false;
            this.showEmail = true;
            this.showAddress = false;
          }
        }
      }
    }
    else {
      this.showPhoneNumber = false;
      this.showEmail = false;
    }
  }


  getFormattedPhNo(PhoneNo: any): any {
    //ADDING FOR EXTENSION FIELD
    let _number: any;
    if (PhoneNo.value != undefined && PhoneNo.value != '') {
      if (PhoneNo.type == '3') {
        let PhnoExt = [];
        PhnoExt = PhoneNo.value.split(':');
        if (PhnoExt.length > 1) {
          PhoneNo.extension = PhnoExt[0];
          PhoneNo.value = PhnoExt[1];
        }
      }
      _number = PhoneNo.extension ? this.formatphno.transform(`${PhoneNo.extension}:${PhoneNo.value}`, this.localization.captions.common.ExtensionFormat) : this.formatphno.transform(PhoneNo.value, this.localization.captions.common.PhoneFormat);
    }
    return _number;
  }
  IsPatronInfoMatching() {
    if (this.datainput.loyaltyDetail && this.datainput.loyaltyDetail.length > 0) {
      let matcingLoyalty = this.datainput.loyaltyDetail.filter(x => x.patronId.toLowerCase().indexOf(this.searchText) >= 0)
      if (matcingLoyalty.length > 0) {
        this.showPatronId = true
        this.patronId = matcingLoyalty[0].patronId;
      }
    }
  }

}