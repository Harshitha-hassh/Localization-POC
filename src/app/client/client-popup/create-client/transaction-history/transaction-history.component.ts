import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { GuestRetailTransactionHistory, Transaction } from '../../../../shared/shared-models';
import { Subscription } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { MultipackAPIModel,MultipackUIModel,MultpackHistoryRequest } from './multipack.model';
@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransactionHistoryComponent implements OnInit {
  @Input() parentForm:UntypedFormGroup;
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
  clientId: number;
  clientGuid: string;
  showMultiPackExpiredFlag:boolean = false;
  floatLabel: string;

  @Input('inputData')
  set formData(value) {
    if(value && value.data!='')
    {
      this.clientId = value.data.client.id;
      this.clientGuid = value.data.client.guestId;
      if(this.clientId > 0){
        this.GetSalesHistory();        
      }  

      if(this.clientGuid){
        this.getMultipackDetails(this.clientGuid);
      }
    }
  }
  guestMultipackAPIData: Array<MultipackAPIModel>;
  guestMultipacks: Array<MultipackUIModel>;

  constructor(public localization: RetailLocalization, private http: HttpServiceCall, 
    private utilities: RetailUtilities,
    public PropertyInfo: RetailPropertyInformation) {
    this.captions = this.localization.captions.bookAppointment;
    this.historyTypes = [{ "id": "1", "name": this.captions.FrequentlyPurchasedItems },
    { "id": "2", "name": this.captions.SalesHistory },
    { "id": "3", "name": this.captions.multipack_details }
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
        this.tableHeaderArray = [{ tableHeader: this.captions.dateandTime, keyValue: "DateRedeemed", alignType: "left" },
        { tableHeader: this.captions.multipack, keyValue: "MultipackDescription", alignType: "left" },
        { tableHeader: this.captions.dateofsale, keyValue: "DateOfSale", alignType: "left" },
        { tableHeader: this.captions.redeemSession, keyValue: "RedeemedCount", alignType: "left" },
        { tableHeader: this.captions.remainingsession, keyValue: "RemainingCount", alignType: "left" },
        { tableHeader: this.captions.dateofexpiry, keyValue: "DateOfExpiry", alignType: "left" },
        { tableHeader: this.captions.product, keyValue: "Product", alignType: "left" }];
       if(this.guestMultipackAPIData){
          this.tableDataArray =  this.mapMultipackToUI(this.guestMultipackAPIData); 
        } 
        break;
    }

  }
  selectedRow(item) {
    if (this.historyType == 2) {
      this.itemArray = [];

      this.itemArray = item ? item.transactionDetails.items : [];
    }
    this.selectedRowItem = item
  }


  get sortdataArray() {
    return this.tableDataArray.sort((a, b) => {
      if(a.hasOwnProperty('date')){
        return <any>this.utilities.getDate(b.date) - <any>this.utilities.getDate(a.date);
      }else if(a.hasOwnProperty('DateRedeemed')){        
        return <any>new Date(b.DateRedeemed).getTime() - <any>new Date(a.DateRedeemed).getTime();       
      }else{
        return true;
      }

    });
  }
  
  ngOnInit() {
    this.initializeFormData();
  }
  async initializeFormData(){
    this.historyType = this.historyTypes[0].id;
    this.changeType();
  }

  GetSalesHistory()
  {
    this.http.CallApiWithCallback<any>({
      host: Host.retailPOS,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetSalesHistoryTransactionByGuestGuids",
      body:[this.clientGuid],
      method: HttpMethod.Put,
      showError: true,
      extraParams: []
    });
  }

  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams?: any[]) {
    let appointments = [];
    if (callDesc == "GetSalesHistoryTransactionByGuestGuids")
    {
      let res:any = result.result;
      let responseResult: Transaction[] = res;
      let transactionDetail:any;
      let items :any[]=[];
      for (let index1 = 0; index1 < responseResult.length; index1++) {
        let transactionNumber = this.PropertyInfo.UseRetailInterface ?responseResult[index1].transactionData.ticketNumber:responseResult[index1].transactionData.retailTicketNumber ;
        let TransactionDate = responseResult[index1].transactionData.transactionDate ;
        let TotalPrice = (responseResult[index1].transactionData.totalPrice).customToFixed();
        let TotalAmount = (responseResult[index1].transactionData.totalAmount).customToFixed();
        let totalGratuity = (responseResult[index1].transactionData.gratuity).customToFixed();
        let TotalTax = (responseResult[index1].transactionData.totalTax).customToFixed();
        let totalDiscount : number = 0.0;
         let itemDescription;

        if(responseResult[index1].transactionDetails.length <= 0){
          transactionDetail = {
            items: []
          }
        }

        for(let index2 = 0; index2 < responseResult[index1].transactionDetails.length;index2++)
        {
         let QuantitySold = responseResult[index1].transactionDetails[index2].quantitySold;
         let unitPrice = (responseResult[index1].transactionDetails[index2].unitPrice).customToFixed();
         let itemId = responseResult[index1].transactionDetails[index2].itemId;
         itemDescription = responseResult[index1].transactionDetails[index2].itemDescription;
          var indexOfItem = this.frequentlyPurchased.findIndex(i=> i.itemNumber == itemId);
         if(indexOfItem > -1)
         {
          this.frequentlyPurchased[indexOfItem].quantity = Number(this.frequentlyPurchased[indexOfItem].quantity) + Number(QuantitySold);
         }
         else
         {
          this.frequentlyPurchased.push({ "description": itemDescription, "quantity": QuantitySold, "itemNumber": itemId})
         }
        
         let Discount :number= responseResult[index1].transactionDetails[index2].discount;
         totalDiscount += Discount
         items.push({ "name": itemDescription, "quantity": QuantitySold, "price": unitPrice});

           transactionDetail = {
           items: items
           }

        }
       let guestHistory = {
        "date": this.localization.LocalizeDate(TransactionDate),
        "transaction": transactionNumber,
        "grandTotal": this.localization.localizeCurrency(TotalPrice,false),
        "subTotal": this.localization.localizeCurrency(TotalAmount,false),
        "tax": this.localization.localizeCurrency(TotalTax,false),
        "gratuity":this.localization.localizeCurrency(totalGratuity,false),
        "discount": this.localization.localizeCurrency(totalDiscount.customToFixed(),false),
        "transactionDetails":transactionDetail
       }

       appointments.push(guestHistory);
       items = [];
      }
      this.frequentlyPurchased = this.frequentlyPurchased.sort(this.compareItem).reverse();
      this.salesHistory = appointments;
      this.changeType();
    }else if(callDesc == "GetMultiPackRedeemHistoryDetails")
    {
      this.guestMultipackAPIData = <any>result.result;    
    }
  }
  errorCallback<T>(result: BaseResponse<T>): void { }

  compareItem(a, b) {
    const item1 = a.quantity;
    const item2 = b.quantity;
  
    let comparison = 0;
    if (item1 > item2) {
      comparison = 1;
    } else if (item1 < item2) {
      comparison = -1;
    }
    return comparison;
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
  showExpiredMultipacks(event){
    this.showMultiPackExpiredFlag = event;
    if(this.guestMultipackAPIData){
      this.tableDataArray =  this.mapMultipackToUI(this.guestMultipackAPIData); 
    }  
  }

  public getMultipackDetails(guestId: string){
    const request =<MultpackHistoryRequest>{
      "GuestGuid": guestId,
      "IsIncludeExpiredMultipacks":true
    }

    this.http.CallApiWithCallback<any>({
      host: Host.retailPOS,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetMultiPackRedeemHistoryDetails",
      body: request,
      method: HttpMethod.Put,
      showError: true,
      extraParams: []
    });
  }
  
  public mapMultipackToUI(multipacks: MultipackAPIModel[]): MultipackUIModel[]{
    if(multipacks && multipacks.length > 0){
      let result = multipacks.map(x=> {
        return <MultipackUIModel>{
          DateRedeemed: x.redeemedSessions == 0?this.localization.LocalizeShortDateTime(x.clientMultiPackSaleDateTime):
           this.localization.LocalizeShortDateTime(x.clientMultiPackRedeemDateTime),
          DateOfSale: this.localization.LocalizeShortDateTime(x.clientMultiPackSaleDateTime),
          DateOfExpiry: this.localization.LocalizeShortDate(x.multipackExpirytDate),
          MultipackDescription: x.multiPackName,
          RedeemedCount: x.redeemedSessions.toString(),
          RemainingCount: x.isUnlimitedMultipack == true?this.captions.NotAvailable:x.remainingSessions.toString(),
          IsMultipackExpired: x.isMultiPackExpired,
          Product: x.productName,
        }
      });
   
      if(!this.showMultiPackExpiredFlag){           
        result = result.filter(x=>x.IsMultipackExpired == false);
      }

      return result;
    }else
    {
      return new Array<MultipackUIModel>();
    }
  }
}
