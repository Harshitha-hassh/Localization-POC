import { Injectable } from '@angular/core';
import { ActionTypeEnum, SorTypeEnum } from 'src/app/common/components/cdkvirtual/cdkvirtual.model';
import { UI, API, CGtablecontent } from 'src/app/common/components/combine-guest-records/combine-guest-ui-model';
import { CombineGuestDataService} from 'src/app/shared/service/combineGuest.data.service';
import { UI as GuestUI, ContactPhoneType, ContactEmailType } from 'src/app/common/components/combine-guest-records/guest-model';
import { combineGuestRecordBusiness } from 'src/app/common/components/combine-guest-records/combine-guest-records.business';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { AlertType } from 'src/app/common/shared/shared/enums/enums';
import { ButtonType } from 'src/app/common/enums/shared-enums';
import { AlertAction } from 'src/app/common/shared/shared.modal';
import { AlertPopupComponent } from 'src/app/common/components/alert-popup/alert-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class CombineGuestRecordsService extends combineGuestRecordBusiness  {
  captions: any;
  contactTypes: any;
  contactPhoneType: ContactPhoneType[] = [];
  contactEmailType: ContactEmailType[] = [];
  isViewOnly: boolean;
  subscription: any;

  constructor(public localization: RetailStandaloneLocalization,
      public combineGuestdataservice: CombineGuestDataService,public dialog:MatDialog
  ) {
      super(localization);
      this.captions = this.localization.captions;

  }

  getTableOptions() {
      return {
          defaultsortingColoumnKey: 'firstName',
          defaultSortOrder: SorTypeEnum.asc,
          showTotalRecords: false,
          columnFreeze: {
              firstColumn: true,
              lastColumn: false
          }
      };
  }

  //async getUserAccess(breakPoint: number) {
  //    const breakpoint = await this.facadeService.getUserAccess(breakPoint, true);
  //    this.isViewOnly = breakpoint.isViewOnly
  //    return breakpoint;
  //}

   public async combineGuestRecords(primarydata, secondarydata):Promise<boolean> {
       const mergeResponse = await this.combineGuestdataservice.MergeGuestsRecords(primarydata, secondarydata);
       return mergeResponse;
   }

// public async folioPostUpdate(primarydata, secondarydata) {
//   const folioupdateResponse = await this.combineGuestdataservice.FolioPostUpdate(primarydata, secondarydata);
//   return folioupdateResponse;
// }


 public async getGuests(searchCriteria: UI.GuestSearchFields): Promise<CGtablecontent[]> {
   const searchCriteriaAPIModel: API.GuestSearchFields = this.apiMapperGuestSearchFields(searchCriteria);
   const apiGuestModels: API.Guest[] = await this.combineGuestdataservice.getGuestsBySearchCriteria(searchCriteriaAPIModel);    
    //const returnArray: CGtablecontent[] = apiGuestModels.map(x => this.uiMapper_SearchGrid(x));
   const returnArray: CGtablecontent[] = apiGuestModels.map(x => this.uiGridMapper(x));
   return returnArray;
 }

public uiGridMapper(GuestAPIModel: API.Guest): CGtablecontent {
  return {
    id: GuestAPIModel.guestId,
    lastname: GuestAPIModel.lastName,
    firstname: GuestAPIModel.firstName,
    title: GuestAPIModel.title,
    initial: GuestAPIModel.initial,
    company: GuestAPIModel.companyName,
    companyid: '0',
    address: GuestAPIModel.guestProfileAddress[0]?.addressLine1,
    postalcode: GuestAPIModel.guestProfileAddress[0]?.zipCode,
    city: GuestAPIModel.guestProfileAddress[0]?.city,
    county: GuestAPIModel.guestProfileAddress[0]?.county,
    phonenumber: this.getPhoneNo(GuestAPIModel.guestProfileContact),
    email: this.getEmaiId(GuestAPIModel.guestProfileContact),
    //guesttype: GuestAPIModel.pmsGuest.guestTypeId ? guesttype.find(x => x.id === GuestAPIModel.pmsGuest.guestTypeId)?.name : '',
    //origin: GuestAPIModel.pmsGuest.originId ? org.find(x => x.id === GuestAPIModel.pmsGuest.originId)?.name : '',
    //segment1: GuestAPIModel.pmsGuest.segment1Id ? seg1.find(x => x.id === GuestAPIModel.pmsGuest.segment1Id)?.name : '',
    //segment2: GuestAPIModel.pmsGuest.segment2Id ? seg2.find(x => x.id === GuestAPIModel.pmsGuest.segment2Id)?.name : '',
     state: GuestAPIModel.guestProfileAddress[0]?.state,
    country: GuestAPIModel.guestProfileAddress[0]?.country,
    clubnumber: GuestAPIModel.clubCardNumber,
    membernumber: GuestAPIModel.memberNumber,
    patronid: GuestAPIModel.patronId

  } as CGtablecontent;
}
public getEmaiId(guestProfileContact: any) {
  let emailId = '';
  const mailTypes = this.getEmailType().map(x => x.id);
  const result = guestProfileContact.filter(x => mailTypes.includes(x.type) && x.ispublic !== 'true');
  if (result && result.length > 0) {
    const isprimary = result.find(x => x.isPrimary === 'true');
    if (isprimary) 
    {
      emailId = isprimary.value
    }
    else
    {
      const ispersonal = result.find(x => x.name === 'Personal');        
      emailId = ispersonal ? ispersonal.value : result[0].value;
    }  
  }
  return emailId;
}
public getPhoneNo(guestphoneContact: any) {
  let phoneNo = '';
  const phoneTypes = this.getPhoneType().map(x => x.id);
  const result = guestphoneContact.filter(x => phoneTypes.includes(x.type) && x.ispublic !== true);
  if (result && result.length > 0) {
    const isprimary = result.find(x => x.isPrimary === true);
    if (isprimary) {
      phoneNo = isprimary.value
    }
    else {
      const phoneType = result.find(x => x.name == "Cell");
      if (phoneType?.value) {
        phoneNo = phoneType?.value;
      }
      else {
        const ispersonal = result.find(x => x.name == "Home");
        phoneNo = ispersonal ? ispersonal.value : result[0].value;
      }

    }
  }
  return phoneNo;
}
getPhoneType() {
  this.contactTypes = this.captions.contactTypesOptions;
  return this.contactPhoneType = [
    { id: 2, description: this.contactTypes.home, type: 'Phone' },
    { id: 3, description: this.contactTypes.work, type: 'Phone' },
    { id: 1, description: this.contactTypes.mobile, type: 'Phone' }
  ];
}
getEmailType() {
  this.contactTypes = this.captions.contactTypesOptions;
  return this.contactEmailType = [
    { id: 9, description: this.contactTypes.personal, type: 'Email' },
    { id: 10, description: this.contactTypes.work, type: 'Email' }
  ];
}

public apiMapperGuestSearchFields(GuestSearchFieldsUIModel: UI.GuestSearchFields): API.GuestSearchFields {

  return {
    lastName: GuestSearchFieldsUIModel.lastName,
    firstName: GuestSearchFieldsUIModel.firstName,
    cityName: GuestSearchFieldsUIModel.cityName,
    stateCode: GuestSearchFieldsUIModel.stateCode,
    postalCode: GuestSearchFieldsUIModel.postalCode,
    stateName: GuestSearchFieldsUIModel.stateName,
    county: GuestSearchFieldsUIModel.county,
    countryName: GuestSearchFieldsUIModel.countryName,
    nationality: GuestSearchFieldsUIModel.nationality,
    phone: GuestSearchFieldsUIModel.phone,
    socialSecurityNumber: GuestSearchFieldsUIModel.socialSecurityNumber,
    emailAddress: GuestSearchFieldsUIModel.emailAddress,
    driversLicense: GuestSearchFieldsUIModel.driversLicense,
    playerId: GuestSearchFieldsUIModel.playerId,
    memberTypeId: GuestSearchFieldsUIModel.memberTypeId,
    includeInactive: false,
    title:GuestSearchFieldsUIModel.title,
    address:GuestSearchFieldsUIModel.address,
    isFilterApplied:GuestSearchFieldsUIModel.isFilterApplied,
    //PMSGuestSearchCriteria: this.mapPMSSearchCriteria(GuestSearchFieldsUIModel),
    AdditionalSearchCriteria: this.mapAdditionalSearchCriteria(GuestSearchFieldsUIModel)
  } as API.GuestSearchFields;
}

mapAdditionalSearchCriteria(GuestSearchFieldsUIModel: UI.GuestSearchFields) {
  return {
    companyName: GuestSearchFieldsUIModel.additionalSearch.companyName,
    guestID: GuestSearchFieldsUIModel.additionalSearch.guestID,
    clubMember: GuestSearchFieldsUIModel.additionalSearch.clubMember,
    memberNumber: GuestSearchFieldsUIModel.additionalSearch.memberNumber,
    memberType: GuestSearchFieldsUIModel.additionalSearch.memberType,
    memberCategory: GuestSearchFieldsUIModel.additionalSearch.memberCategory,
    ownerRoomNo: GuestSearchFieldsUIModel.additionalSearch.ownerRoomNo,
    ownerContractNo: GuestSearchFieldsUIModel.additionalSearch.ownerContractNo,
    ownerARNo: GuestSearchFieldsUIModel.additionalSearch.ownerARNo,
    createdOn: GuestSearchFieldsUIModel.additionalSearch.createdOn,
    updatedOn: GuestSearchFieldsUIModel.additionalSearch.updatedOn
  } as API.GuestAdditionalSearchCriteria;
}

//mapPMSSearchCriteria(GuestSearchFieldsUIModel: UI.GuestSearchFields) {
//  return {
//    guestTypeId: GuestSearchFieldsUIModel.guestTypeId ? GuestSearchFieldsUIModel.guestTypeId : 0,
//    originId: GuestSearchFieldsUIModel.originId ? GuestSearchFieldsUIModel.originId : 0,
//    segment1Id: GuestSearchFieldsUIModel.segment1Id ? GuestSearchFieldsUIModel.segment1Id : 0,
//    segment2Id: GuestSearchFieldsUIModel.segment2Id ? GuestSearchFieldsUIModel.segment2Id : 0,
//    marketChannelId: GuestSearchFieldsUIModel.marketChannelId ? GuestSearchFieldsUIModel.marketChannelId : 0,
//    aRNumber: GuestSearchFieldsUIModel.aRNumber,
//    accountNumber: Number(GuestSearchFieldsUIModel.accountNumber ? GuestSearchFieldsUIModel.accountNumber : 0)
//  } as API.PMSSearchCriteria;
//}

headerGenerator() {
  return [
    {
      displayName: '',
      key: 'selected',
      searchable: false,
      sorting: false,
      templateName: ActionTypeEnum.radioButton,
      radioKey: 'id'
    },
    {
    displayNameId: 'tbl_hdr_lastName',
      displayName: this.captions.tbl_hdr_lastName,
      key: 'lastname',
      searchable: false,
      sorting: true,
      sortingKey: 'lastname',
    },
    {
    displayNameId: 'tbl_hdr_firstName',
      displayName: this.captions.tbl_hdr_firstName,
      key: 'firstname',
      searchable: false,
      sorting: true,
      sortingKey: 'firstname',
    },
    {
    displayNameId: 'tbl_hdr_title',
      displayName: this.captions.tbl_hdr_title,
      key: 'title',
      searchable: false,
      sorting: true,
      sortingKey: 'title',
    },    
    {
    displayNameId: 'tbl_hdr_address',
      displayName: this.captions.tbl_hdr_address,
      key: 'address',
      searchable: false,
      sorting: true,
      sortingKey: 'address',
    },
    {
    displayNameId: 'tbl_hdr_postalCode',
      displayName: this.captions.tbl_hdr_postalCode,
      key: 'postalcode',
      searchable: false,
      sorting: true,
      sortingKey: 'postalcode',
    },
    {
    displayNameId: 'tbl_hdr_city',
      displayName: this.captions.lbl_city,
      key: 'city',
      searchable: false,
      sorting: true,
      sortingKey: 'city',
    },      
    {
    displayNameId: 'lbl_phoneNumber',
      displayName: this.captions.lbl_phoneNumber,
      key: 'phonenumber',
      searchable: false,
      sorting: true,
      sortingKey: 'phonenumber',
    },
    {
    displayNameId: 'lbl_emailID',
      displayName: this.captions.lbl_emailID,
      key: 'email',
      searchable: false,
      sorting: true,
      sortingKey: 'email',
    },      
    {
    displayNameId: 'tbl_hdr_state',
      displayName: this.captions.tbl_hdr_state,
      key: 'state',
      searchable: false,
      sorting: true,
      sortingKey: 'state',
    },
    {
    displayNameId: 'lbl_country',
      displayName: this.captions.lbl_country,
      key: 'country',
      searchable: false,
      sorting: true,
      sortingKey: 'country',
    },      
    {
    displayNameId: 'lbl_patronId',
      displayName: this.captions.lbl_patronId,
      key: 'patronid',
      searchable: false,
      sorting: true,
      sortingKey: 'patronid',
    }
  ];
}
getConfigureDataList(hdrObj) {
  const objColllist = [];
  hdrObj.forEach(element => {
    if (element.displayName !== '') {
      const obj = {
        show: true,
        disabled: false,
        checked: false,
        displayName: element.displayName,
        key: element.key
      };
      objColllist.push(obj);
    }
  });
  return objColllist;
}

public async getGuestInformationByGuid(Guid: string): Promise<GuestUI.Guest> {
  const guestData: API.Guest =await  this.combineGuestdataservice.GetClientDataByGuid([Guid]);
  return this.uiMapper_GuestInformation(guestData);
}

public async combineGuestInfo(guestInfo){
   await this.combineGuestdataservice.UpdateGuestInformation(guestInfo);
}

async getGuestsforEmptyFilter(filterName: string): Promise<CGtablecontent[]>{
  const apiGuestModels: API.Guest[] = await this.combineGuestdataservice.getGuestsByEmptySearchCriteria(filterName);
  const returnArray: CGtablecontent[] = apiGuestModels.map(x => this.uiGridMapper(x));
  return returnArray;
}

public uiMapper_GuestInformation(GuestAPIModel: API.Guest): GuestUI.Guest {
  const guestItem: GuestUI.Guest = {} as GuestUI.Guest;
  Object.assign(guestItem, GuestAPIModel);

  return guestItem;
}

  /**
* Alert popup to show 'Warning' , 'Error' , 'Success'
* @param {string} message  - Content
* @param {AlertType} type  - Type of Popup
* @param {ButtonType} [btnType=ButtonType.Ok] - Button Actions Type( by default 'Ok')
* @param {(result: string, extraParams?: any[]) => void} [callback] - CallBack ( optional )
* @returns - Dialog Reference of the modal with Result of enum AlertAction
* @memberof Utilities
*/
public showAlert(message: string, type: AlertType, btnType: ButtonType = ButtonType.Ok,
  callback?: (result: AlertAction, extraParams?: any[]) => void, extraParams?: any[], headerText?: string,
  additionalInfo?: { message: string, class: string }, moreOptionsLabel?: string, moreOptions?: any) {

    const dialogRef = this.dialog.open(AlertPopupComponent, {
      height: 'auto',
      width: '300px',
      data: { type, message, buttontype: btnType, header: headerText, additionalInfo, moreOptionsLabel, moreOptions },
      panelClass: 'small-popup',
      disableClose: true,
    });
    this.subscription = dialogRef.afterClosed().subscribe(res => {
      if (callback) {
        callback(res, extraParams);
      }
    });
    return dialogRef;
}

//public  async getGuestTypeOptions() {
//  return await this._guestTypeDataService.getAllGuestTypes();
// }
// public async getSegment2Options() {
//  return await  this._segment2DataService.getAllSegment2s();
// }
// public async getSegment1Options() {
//   return await this._segment1DataService.getAllSegment1s();
// }
// public async getAllOriginTypes() {
//   return await this._originTypeDataService.getAllOrigins();
// }
}
