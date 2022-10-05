import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { EmptyValueValidator } from 'src/app/retail/shared/Validators/EmptyValueValidator';
import { ContactTypeId, PhoneNumber, Email } from '../../shared-models';
import { ClientDataService } from '../../data-services/client.data.service';
import { NotificationDataService } from '../../data-services/notification.data.service';
import { Client, ClientInfo } from 'src/app/client/client-popup/create-client/client.modal';
import { DefaultGUID } from 'src/app/common/shared/shared/globalsContant';
import { Localization } from 'src/app/common/localization/localization';

@Component({
  selector: 'app-notify-popup',
  templateUrl: './notify-popup.component.html',
  styleUrls: ['./notify-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotifyPopupComponent implements OnInit {

  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  captions: any = this.localilzation.captions.common;
  rowchecked:boolean = true;
  showNotificationSection: boolean;
  notifydetails: FormGroup;
  clientInfo: any;
  selectedClientId: any;
  isConfirmationRecapSearchScreen = false;
  changedemailId:number;
  changedphoneId:number;
  extension:string='';
  showLoader = false;
  includeIntakeForm :boolean =false;
  isReadOnly:boolean=true;
  transactionId: number = 0;
  guestId: number =0;
  title: string ='';
  disableEmailSMSToggle: boolean = false;
  floatLabel: string;

  constructor(private localilzation: RetailLocalization, 
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<NotifyPopupComponent>,
    private clientDataService: ClientDataService,
    private notificationDataService: NotificationDataService,
    private localization : Localization ) {
     this.selectedClientId = this.data.guestId;
     this.transactionId=  this.data.transactionId;
     this.title =this.data.title;
     this.floatLabel = this.localization.setFloatLabel;
  }


  async ngOnInit() {
    this.notifydetails = this._fb.group({
      enableSendEmail: false,
      enableSendSMS: false,
      enableSaveEmail: false,
      intakeForm: false,
      detailList: this._fb.array([]),
    });

    this.showLoader = true;
    this.clientInfo =[];   
    await this.BindClientInfo();
    if (this.clientInfo != ""){
        this.setcliendetails(this.clientInfo);
    }
  }

  async BindClientInfo() {
    const Clients = await this.clientDataService.getClients([this.selectedClientId]);
    this.clientInfo = Clients[0];          
    let displayContactInfo: boolean = true;
    if (this.clientInfo.phoneNumbers && this.clientInfo.phoneNumbers.length > 0 && displayContactInfo) {
        for (let index = 0; index < this.clientInfo.phoneNumbers.length; index++) {
          this.clientInfo.phoneNumbers[index].id =index+1;
        }
    }
    if (this.clientInfo.emails && this.clientInfo.emails.length > 0 && displayContactInfo) {
        for (let index = 0; index < this.clientInfo.emails.length; index++) {
          this.clientInfo.emails[index].id =index+1;
        }      
    }
    this.showLoader = false;      
    this.disableEmailSMSToggle = !this.clientInfo.guestId || this.clientInfo.guestId == DefaultGUID ? true : false;
  }

  setcliendetails(data) {
    if (Object.keys(data).length > 0) {
      const _name = data.firstName + ' ' + data.lastName;
      let emaildata = data.emails ? this.GetEmail(data.emails) : undefined;
      const _email = emaildata?emaildata.emailId:'';
      this.changedemailId = emaildata?emaildata.id:0;

      let phoneNodata = data.phoneNumbers ? this.GetPhoneNumber(data.phoneNumbers) : undefined; 
      if (phoneNodata) {    
        if (phoneNodata.contactTypeId === ContactTypeId.Work) { //Added For Extension when contact type is work
          const arr = phoneNodata.number.split(':');
          phoneNodata.number = arr.length > 1 ? arr[1] : phoneNodata.number;
          this.extension = arr[0] ? arr[0] : '';
        }
      }
      const _phonenumber = phoneNodata?phoneNodata.number:'';
      this.changedphoneId = phoneNodata?phoneNodata.id:0;
      const phoneNumber = _phonenumber && _phonenumber.split('|');
      const _countrycode = phoneNumber && phoneNumber[0] ? phoneNumber[0] : '';
      const _phoneno = phoneNumber && phoneNumber[1] ? phoneNumber[1] : '';

      this.createdetailList(_name, _email, _countrycode, _phoneno, data,0);
    }
  }


  GetEmail(email:any):any{
    let primaryEmail =email.find(x => x.isPrimary);
    let personalEmail = email.find(x => x.contactTypeId == ContactTypeId.Personal );
    let officeEmail = email.find(x => x.contactTypeId == ContactTypeId.Office);
    if (primaryEmail) {
      return primaryEmail;
    }else if(personalEmail){
      return personalEmail;
    }else if(officeEmail){
      return officeEmail;
    }else{
      return email[0];
    }
  }


  GetPhoneNumber(phoneNumber:any):any{
    let primaryPhone = phoneNumber.find(x => x.isPrimary);
    let cellphone = phoneNumber.find(x => x.contactTypeId == ContactTypeId.Cell);
    let homephone = phoneNumber.find(x => x.contactTypeId == ContactTypeId.Home);
    if (primaryPhone) {
      return primaryPhone;
    }else if(cellphone){
      return cellphone;
    }else if(homephone){
      return homephone;
    }else{
      return phoneNumber[0];
    }
  }

  createdetailList(_name,_email,_countrycode,_phoneno,obj,id) {
    const creds = this.notifydetails.controls.detailList as FormArray;
    creds.push(this._fb.group({
      name: _name,
      emailId: _email,
      countryCode:_countrycode,
      phoneNo: _phoneno,
      obj: obj,
      id: id,
      ischecked:true
    })
    );
    this.checkclicked(true, '0');
  }

  emailsmstoggle(e, currcontrol, altcontrol) {
    let alttoggleflag = this.notifydetails.controls[altcontrol].value;
    this.notifydetails.controls[currcontrol].setValue(e);
    this.checkclicked(true, '0');
    this.showNotificationSection = (e || alttoggleflag);
  }

  enableSaveEmail(e) {   
    this.notifydetails.controls['enableSaveEmail'].setValue(e);
  }

  checkclicked(e, i) {
    let currentControl = this.notifydetails.controls['detailList']['controls'][i];
    if (e) {
      if (this.notifydetails.controls['enableSendEmail'].value) {
        currentControl.controls['emailId'].enable();
        currentControl.get("emailId").markAsTouched();
        currentControl.get("emailId").setValidators([Validators.required, EmptyValueValidator, Validators.email]);
        currentControl.get("emailId").updateValueAndValidity();
        this.isReadOnly = false;
      } else {
        currentControl.controls['emailId'].disable();
        this.isReadOnly = true;
      }
      if (this.notifydetails.controls['enableSendSMS'].value) {
        currentControl.controls['phoneNo'].enable();
        currentControl.get("phoneNo").markAsTouched();
        currentControl.get("phoneNo").setValidators([Validators.required]);
        currentControl.get("phoneNo").updateValueAndValidity();

        currentControl.controls['countryCode'].enable();
        currentControl.get("countryCode").markAsTouched();
        currentControl.get("countryCode").setValidators([Validators.required]);
        currentControl.get("countryCode").updateValueAndValidity();


      } else {
        currentControl.controls['countryCode'].disable();
        currentControl.controls['phoneNo'].disable();
      }
    } else {
      currentControl.controls['emailId'].disable();
      currentControl.controls['countryCode'].disable();
      currentControl.controls['phoneNo'].disable();
      currentControl.get("emailId").clearValidators();
      currentControl.get("emailId").updateValueAndValidity();
    }
  }

  includeIntakeFormToggle(e)
  {
    this.notifydetails.controls['intakeForm'].setValue(e);
  }

  async sendNotification() {
    let emailid = this.notifydetails.controls['detailList'].value[0].emailId;
    let phoneNo = this.notifydetails.controls['detailList'].value[0].phoneNo;
    let countryCode = this.notifydetails.controls['detailList'].value[0].countryCode;

    let phoneNodata = this.extension!='' ? this.extension+":"+countryCode+"|"+phoneNo:countryCode+"|"+phoneNo;
    this.ReplaceEmailId(this.changedemailId,emailid); 
    this.ReplacePhoneNumber(this.changedphoneId,phoneNodata); 

    let phoneNumber = this.notifydetails.controls['enableSendSMS'].value ? this.notifydetails.controls['detailList'].value[0].countryCode + phoneNo : "";

    this.notificationDataService.SendNotification(this.transactionId, true,emailid, phoneNumber,
      this.notifydetails.controls['enableSendSMS'].value, this.notifydetails.controls['enableSendEmail'].value);

    if (this.notifydetails.controls['enableSaveEmail'].value) {
      this.clientDataService.UpdateClientDetails(this.MapToClientInfoObj(this.clientInfo));
    }
    this.dialogRef.close(true);
  }

  ReplaceEmailId(emaildataId: any, emailId: any) {
    if(emailId){
      if(emaildataId!=0)
      {
        this.clientInfo.emails.forEach(element => {
          if(element.id == emaildataId){
            element.emailId = emailId;
          }
      });
      }else{
        let email:Partial<Email>={
          clientId :0,
          emailId :emailId,
          isPrimary :false,
          isPrivate:false,
          contactTypeId :ContactTypeId.Personal 
        }
        this.clientInfo.emails.push(email);
      }    
    }     
  }

  ReplacePhoneNumber(phoneId: any,phoneNo :string) {
    if(phoneNo){
      if(phoneId!=0){
        this.clientInfo.phoneNumbers.forEach(element => {
          if(element.id == phoneId){
            element.number = phoneNo;
          }
      });
      }else{
        let phoneNumber :Partial<PhoneNumber>={
          contactTypeId : ContactTypeId.Cell,
          clientId:0,
          isPrimary:false,
          isPrivate:false,
          number :phoneNo
        };
        this.clientInfo.phoneNumbers.push(phoneNumber);
      } 
    } 
  }

  close() {
    this.dialogRef.close(false);

  }

  private MapToClientInfoObj(clientobj) {
    return {
        id: clientobj.id,
        client: {
            id: clientobj.id,
            guestId:  clientobj.guestId,
            title: clientobj.title ? clientobj.title : "",
            firstName: clientobj.firstName ? clientobj.firstName : "",
            lastName: clientobj.lastName ? clientobj.lastName : "",
            pronounce: clientobj.pronounce ? clientobj.pronounce : "",
            gender: clientobj.gender ? clientobj.gender : "",
            dateOfBirth: clientobj.dateOfBirth ? clientobj.dateOfBirth : "",
            comments: clientobj.comments ? clientobj.comments : "",
            lastChangeId: clientobj.lastChangeId ? clientobj.lastChangeId : DefaultGUID,
            interfaceGuestId: clientobj.interfaceGuestId ? clientobj.interfaceGuestId : "",
            loyaltyDetail: clientobj.loyaltyDetail ? clientobj.loyaltyDetail : [],
        } as Client,
        emails: clientobj.emails,
        addresses: clientobj.addresses,
        phoneNumbers: clientobj.phoneNumbers,
        clientCreditCardInfo: clientobj.clientCreditCardInfo ? clientobj.clientCreditCardInfo : null
    } as ClientInfo;
  }

}
