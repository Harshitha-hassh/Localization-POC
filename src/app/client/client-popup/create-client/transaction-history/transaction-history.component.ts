import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { GuestRetailTransactionHistory } from '../../../../shared/shared-models';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { PropertyInformation } from 'src/app/retail/common/services/property-information.service';
import { FormGroup } from '@angular/forms';
import { Localization } from 'src/app/common/shared/localization/Localization';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { Utilities } from 'src/app/common/shared/shared/utilities/utilities';
@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransactionHistoryComponent implements OnInit {
  @Input() parentForm:FormGroup;
  historyTypes: any = [];
  selectedRowItem: any;
  historyType: any;
  tableHeaderArray: any = [];
  tableDataArray: any = [];
  itemArray: any = []
  allTherapists: any = [];
  allServices: any = [];
  frequentlyPurchased = [];
  salesHistory = []; 
  appointmentDetails = [];
  cancellations = [];
  teeTimes = [];
  activities = [];
  transactionDetails = []
   
  captions: any;
  clientAppointments: any[];
  clientWindowConvertion : Subscription;
  isFirstTime: boolean = true;

  constructor(public localization: Localization, private http: HttpServiceCall, 
    private utilities: Utilities,
    public PropertyInfo: PropertyInformation) {
    this.captions = this.localization.captions.bookAppointment;
    this.historyTypes = [{ "id": "1", "name": this.captions.FrequentlyPurchasedItems },
    { "id": "2", "name": this.captions.SalesHistory },
    { "id": "3", "name": this.captions.AppointmentDetails },
    { "id": "4", "name": this.captions.CancellationsandNoShows }
    // Commented below for disabling GroupAppointments, Activities option
    // { "id": "5", "name": this.captions.TeeTimes },
    // { "id": "6", "name": this.captions.Activities }
  ]
  }

  changeType() {
    this.tableDataArray = [];
    this.tableHeaderArray = [];

    switch (this.historyType) {
      case "1":
        this.tableHeaderArray = [{ tableHeader: this.captions.Quantity, keyValue: "quantity", alignType: "right" },
        { tableHeader: this.captions.ItemNumber, keyValue: "itemNumber", alignType: "right" },
        { tableHeader: this.captions.Description, keyValue: "description", alignType: "left" }];
        this.tableDataArray = this.frequentlyPurchased;
        break;

      case "2":
        this.tableHeaderArray = [{ tableHeader: this.captions.Date, keyValue: "date", alignType: "left" },
        { tableHeader: this.captions.TransactionNo, keyValue: "transaction", alignType: "right" },
        { tableHeader: this.captions.GrandTotal + ` (${this.localization.currencySymbol})`, keyValue: "grandTotal", alignType: "left" },
        { tableHeader: this.captions.SubTotal + ` (${this.localization.currencySymbol})`, keyValue: "subTotal", alignType: "left" },
        { tableHeader: this.captions.Tax + ` (${this.localization.currencySymbol})`, keyValue: "tax", alignType: "left" },
        { tableHeader: this.captions.Gratuity + ` (${this.localization.currencySymbol})`, keyValue: "gratuity", alignType: "left" },
        { tableHeader: this.captions.Discount + ` (${this.localization.currencySymbol})`, keyValue: "discount", alignType: "left" }];

        this.tableDataArray = this.salesHistory;
        this.selectedRow(this.salesHistory[0]);
        break;

      case "3":
        this.tableHeaderArray = [{ tableHeader: this.captions.Date, keyValue: "appointmentTime", alignType: "left" },
        { tableHeader: this.captions.TransactionNo, keyValue: "transaction", alignType: "right" },
        { tableHeader: this.captions.Service, keyValue: "service", alignType: "left" },
        { tableHeader: this.captions.TherapistName, keyValue: "therapist", alignType: "left" }];
        // this.tableDataArray = this.appointmentDetails;
        this.tableDataArray = this.clientAppointments.filter(x => x.status == 'RESV' || x.status == 'CKIN' || x.status == 'CKOUT');
        _.sortBy(this.tableDataArray, [function(data) {
          return data.appointmentTime;
        }]);
        this.tableDataArray.reverse();
        break;

      case "4":
        this.tableHeaderArray = [{ tableHeader: this.captions.Date, keyValue: "appointmentTime", alignType: "left" },
        { tableHeader: this.captions.TransactionNo, keyValue: "transaction", alignType: "right" },
        { tableHeader: this.captions.Service, keyValue: "service", alignType: "left" },
        { tableHeader: this.captions.TherapistName, keyValue: "therapist", alignType: "left" },
        { tableHeader: this.captions.CancellationNumber, keyValue: "cancelId", alignType: "left" },
        { tableHeader: this.captions.CancellationComments, keyValue: "cancelComments", alignType: "left" }];
        // this.tableDataArray = this.cancellations;
        this.tableDataArray = this.clientAppointments.filter(x => x.status == 'CANC' || x.status == 'NOSHOW');
        _.sortBy(this.tableDataArray, [function(data) {
          return data.appointmentTime;
        }]);
        this.tableDataArray.reverse();
        break;

      case "5":
        this.tableHeaderArray = [{ tableHeader: this.captions.Date, keyValue: "date", alignType: "left" },
        { tableHeader: this.captions.TransactionNo, keyValue: "transaction", alignType: "right" },
        { tableHeader: this.captions.Course, keyValue: "course", alignType: "left" },
        { tableHeader: this.captions.Status, keyValue: "status", alignType: "left" }];
        this.tableDataArray = this.teeTimes;
        break;

      case "6":
        this.tableHeaderArray = [{ tableHeader: this.captions.Date, keyValue: "date", alignType: "left" },
        { tableHeader: this.captions.TransactionNo, keyValue: "transaction", alignType: "right" },
        { tableHeader: this.captions.Activity, keyValue: "activity", alignType: "left" },
        { tableHeader: this.captions.Status, keyValue: "status", alignType: "left" }];
        this.tableDataArray = this.activities;
        break;
    }

  }
  selectedRow(item) {
    if (this.historyType == 2) {
      this.itemArray = [];

      this.itemArray = item.transactionDetails.items;
    }
    this.selectedRowItem = item
  }


  get sortdataArray() {
    return this.tableDataArray.sort((a, b) => {
      if(a.hasOwnProperty('date')){
        return <any>this.utilities.getDate(b.date) - <any>this.utilities.getDate(a.date);
      }else{
        return true;
      }

    });
  }
  
  ngOnInit() {
    this.initializeFormData();
  }

  async initializeFormData(){
    this.allTherapists =  await this.InvokeServiceCallAsync("GetAllTherapist", Host.spaManagement);
    this.allServices = await this.InvokeServiceCallAsync("GetAllSpaService", Host.spaManagement);
    this.historyType = this.historyTypes[0].id;
    this.changeType();
    // if (this.appointmentPopupService && this.appointmentPopupService.clientId) {
      this.GetSalesHistory();
      this.GetAllAppointments();
    // }
    // this.clientWindowConvertion = this.appointmentPopupService.convertToEdit.subscribe(x =>{
    //   if(x && x.id > 0 && this.isFirstTime){
    //     this.isFirstTime = false;
    //     this.initializeFormData();  
    //   }
    // });
  }

  GetAllAppointments() {
    this.http.CallApiWithCallback<any>({
      host: Host.schedule,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetAppointmentsByStatus",
      uriParams: { clientId: '', status: 'CANC,RESV,NOSHOW,CKIN,CKOUT', date: null },
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  GetSalesHistory()
  {

    this.http.CallApiWithCallback<any>({
      host: Host.retailPOS,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetGuestSalesHistoryTransaction",
      uriParams: { id: ''},
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams?: any[]) {
    let appointments = [];
    if (callDesc == "GetAppointmentsByStatus") {
      let responseResult: any = result.result;
      for (let index = 0; index < responseResult.length; index++) {
        let detail = responseResult[index].appointmentDetail;
        let therapist = responseResult[index].appointmentTherapists;
        let therapistNames: string[] = [];
        therapist.forEach(therap => {
          therapistNames.push(this.getTherapistName(therap.therapistId))
        });
        let appTime: string = this.localization.LocalizeShortDateTime(detail.startTime);
        let appointment = {
          "id": detail.id,
          "appointmentTime": appTime,
          "service": this.getServiceName(detail.serviceId),
          "therapist": therapistNames.join(','),
          "cancelComments": detail.cancelComments,
          "status": detail.status,
          "cancelId": detail.cancelId,
          "transaction": detail.transactionId
        }
        appointments.push(appointment);
      }
      this.clientAppointments = appointments;
    }
    else if (callDesc == "GetGuestSalesHistoryTransaction")
    {
      let res:any = result.result;
      let responseResult: GuestRetailTransactionHistory = res;
      let transactionDetail:any;
      let items :any[]=[];
      for (let index1 = 0; index1 < responseResult.transaction.length; index1++) {
        let transactionNumber = this.PropertyInfo.UseRetailInterface ?responseResult.transaction[index1].transactionData.ticketNumber:responseResult.transaction[index1].transactionData.retailTicketNumber ;
        let TransactionDate = responseResult.transaction[index1].transactionData.transactionDate ;
        let TotalPrice = (responseResult.transaction[index1].transactionData.totalPrice).toFixed(2);
        let TotalAmount = (responseResult.transaction[index1].transactionData.totalAmount).toFixed(2);
        let totalGratuity = (responseResult.transaction[index1].transactionData.gratuity);
        let TotalTax = (responseResult.transaction[index1].transactionData.totalTax).toFixed(2);
        let totalDiscount:number = 0;
         let itemDescription;
        for(let index2 = 0; index2 < responseResult.transaction[index1].transactionDetails.length;index2++)
       {
         let QuantitySold = responseResult.transaction[index1].transactionDetails[index2].quantitySold;
         let unitPrice = (responseResult.transaction[index1].transactionDetails[index2].unitPrice).toFixed(2);
         for(let index3 =0,j=0; index3< Object.keys(responseResult.itemDescription).length; index3++)
         {

          let itemId = responseResult.transaction[index1].transactionDetails[index2].itemId;
          itemDescription = responseResult.itemDescription[itemId];
        }

         let Discount :number= responseResult.transaction[index1].transactionDetails[index2].discount;
         totalDiscount += Discount;
         items.push({ "name": itemDescription, "quantity": QuantitySold, "price": unitPrice});
         transactionDetail = {
          //"transaction": transactionNumber,
           items: items
        }

        }
       let guestHistory = {
        "date": this.localization.LocalizeDate(TransactionDate),
        "transaction": transactionNumber,
        "grandTotal": TotalPrice,
        "subTotal": TotalAmount,
        "tax": TotalTax,
        "gratuity":totalGratuity,
        "discount": totalDiscount,
        "transactionDetails":transactionDetail
       }

       appointments.push(guestHistory);
       items = [];
      }
      this.salesHistory = appointments;
    }
  }
  errorCallback<T>(result: BaseResponse<T>): void { }

  getServiceName(serviceId: any) {
    let services = this.allServices && this.allServices.length > 0 ? this.allServices : [];
    let service = services.find(x => x.id == serviceId);
    return service ? service.description : ''
  }
  getTherapistName(therapistId: any) {
    let therapists = this.allTherapists && this.allTherapists.length > 0 ?this.allTherapists : [];
    let therapist = therapists.find(x => x.id == therapistId);
    return therapist ? `${therapist.firstName} ${therapist.lastName}` : ''
  }


  async InvokeServiceCallAsync(route: string, domain: Host, uriParams?: any): Promise<BaseResponse<any>> {
    let result: BaseResponse<any> = await this.http.CallApiAsync({
        host: domain,
        callDesc: route,
        method: HttpMethod.Get,
        uriParams: uriParams,
    });
    return result.result;
}
  ngOnDestroy(): void {
    if (this.clientWindowConvertion) {
      this.clientWindowConvertion.unsubscribe()
    }
    this.isFirstTime = true;
  }


}
