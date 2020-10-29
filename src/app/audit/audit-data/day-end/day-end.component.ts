import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewChecked } from '@angular/core';
import * as _ from 'lodash'; // STORAGE THE BACK ARRAY
import { MatDialog } from '@angular/material';
import { BaseResponse } from '../../../common/shared/shared.modal';
import { ManagementData, ClientDetail } from '../../../shared/shared-models';
import { GridData, PendingAction, AppointmentData, GridAction, ManagementDataType, NotifyDayEnd } from '../../AuditModals';
import { AuditService } from '../../audit.service';
import { Router } from '@angular/router';
import { PropertyInformation } from '../../../core/services/property-information.service';
import { SubscriptionLike as ISubscription, ReplaySubject } from 'rxjs';
import { SubPropertyModel } from '../../../retail/retail.modals';
import { takeUntil } from 'rxjs/operators';
import { TransactionStatus } from '../../../retail/shared/service/common-variables.service';
import { RetailSharedVariableService } from '../../../retail/shared/retail.shared.variable.service';
import { RetailValidationService } from '../../../retail/shared/retail.validation.service';
import {
  ButtonOptions, Product,
  RetailBreakPoint, SPAScheduleBreakPoint,
  ActionType, Host, ButtonType
} from 'src/app/common/shared/shared/globalsContant';
import { HttpMethod, KeyValuePair, HttpServiceCall, } from 'src/app/common/shared/shared/service/http-call.service';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { CommonAlertPopupComponent } from 'src/app/common/shared/shared/common-alert-popup/common-alert-popup.component';
import { AppModuleService } from 'src/app/core/services/app.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { RedirectToModules } from 'src/app/common/shared/shared/utilities/common-utilities';
import { ButtonType as RetailButtonType } from 'src/app/retail/shared/globalsContant';
import { AlertType } from 'src/app/retail/shared/shared.modal';
import { RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';

@Component({
  selector: 'app-day-end',
  templateUrl: './day-end.component.html',
  styleUrls: ['./day-end.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AppModuleService]
})
export class DayEndComponent implements OnInit, OnDestroy, AfterViewChecked {

  captions: any;
  getheight: NodeJS.Timer;
  tableData: any;
  tableData1: any[];
  header: any;
  DayendCollection: any = [];
  currSysDate: Date = this.PropertyInfo.CurrentDate;
  newSysDate: Date = this.PropertyInfo.CurrentDate;
  canProcess = false;
  isProcessClicked = true;
  successFlag = false;
  success: any;
  GridData: GridData[] = [];
  AppointmentStatus: any;
  captionsBookApp: any;
  $destroyed: ReplaySubject<any> = new ReplaySubject(1);
  managementData: ManagementData;
  allShopItems: any[] = [];
  checkoutAppointments: any[] = []; // used to display appointment ids in open transaction
  appointmentActionHeader = '';
  currentDateForAPI = '';
  hasAccess = false;
  subscriptions: ISubscription[] = [];
  propOutlets: SubPropertyModel[] = [];

  constructor(public localization: RetailLocalization, private dialog: MatDialog, private utils: RetailUtilities, private http: HttpServiceCall,
    private auditService: AuditService, public router: Router,
    // tslint:disable-next-line: max-line-length
    private PropertyInfo: PropertyInformation, private breakPoint: BreakPointAccess, public ams: AppModuleService,
    private retailSharedService: RetailSharedVariableService, private retailValidationService: RetailValidationService,
    private propertyInfo: RetailPropertyInformation,) {
  }

  ngOnInit() {
    this.ams.loaderEnable.pipe(takeUntil(this.$destroyed)).subscribe(loader => {
      const loadingContainer = document.getElementById('custom-cover-spin');
      const loadingContainerMessage = document.getElementById('custom-cover-message');
      if (loadingContainer && loadingContainerMessage) {
        if (loader) {
          loadingContainer.style.display = 'block';
          loadingContainerMessage.innerText = loader;
        } else {
          loadingContainer.style.display = 'none';
          loadingContainerMessage.innerText = '';
        }
      }
    });

    this.captions = this.localization.captions.dayEnd;
    this.AppointmentStatus = this.localization.captions.appointmentSearch;
    this.captionsBookApp = this.localization.captions.bookAppointment;
    // this.hasAccess = this.breakPoint.CheckForAccess([SPAManagementBreakPoint.DayEnd]);
    this.hasAccess = true;
    if (this.hasAccess) {
      this.currentDateForAPI = this.localization.convertDateObjToAPIdate(this.currSysDate);
      // this.newSysDate = this.newSysDate.setDate(this.newSysDate.getDate() + 1);
      this.newSysDate.setDate(this.currSysDate.getDate() + 1);
      this.InitializeGrid();
      this.GetGridData();
      // tslint:disable-next-line: max-line-length
      this.InvokeServiceCall('GetOutletsByProperty', Host.retailManagement, HttpMethod.Get, { PropertyId: Number(this.localization.GetPropertyInfo('PropertyId')) });
    }
    this.ResetServiceObject();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(sub => {
        if (sub) {
          sub.unsubscribe();
        }
      });
    }
    this.$destroyed.next(true);
    this.$destroyed.complete();
  }

  ngAfterViewChecked() {
    setTimeout(() => {
      this.calculateTableWidth();
    }, 1);
  }

  calculateTableWidth() {
    const tableElements = document.getElementsByClassName('DE_Table');
    for (let i = 0; i < tableElements.length; i++) {
      const tableHeight = tableElements[i]['offsetHeight'];
      const tableArea = document.getElementsByClassName('tableSec');
      if (tableHeight > 500) {
        tableArea[i]['style']['height'] = 500 + 'px';
      } else {
        tableArea[i]['style']['height'] = tableHeight + 'px';
      }
    }
  }

  private InitializeGrid() {
    const gridItems: any[] = [
      {
        status: PendingAction.OpenTransaction,
        displayName: this.captions.OpenTransactions
      }
    ];

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < gridItems.length; i++) {
      this.GridData.push(
        {
          status: gridItems[i].status,
          displayName: gridItems[i].displayName,
          tableOptions: {
            TableHdrData: [],
            TablebodyData: []
          },
          options: [],
          dataCount: 0,
          isLoaded: false
        }
      );
    }
  }

  GetGridData() {
    this.GetOpenTransactions();
  }


  private GetOpenTransactions() {
    this.InvokeServiceCall('GetAllTransactions', Host.retailPOS, HttpMethod.Get, { status: TransactionStatus.OPEN, outletId: 0 });
  }

  async successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): Promise<void> {
    switch (callDesc) {
      case 'GetAllTransactions': {
        const response = result.result as any;
        await this.BuildOpenTransactions(response);
        break;
      }
      case 'GetTransactionDetails': {
        const response = result.result as any;
        this.BuildTransactionDetails(response, extraParams ? extraParams[0] : '');
        break;
      }
      case 'GetShopItems': {
        this.allShopItems = result.result as any;
        break;
      }
      case 'PerformDayEnd': {
        const response = result.result as any;
        if (response) {
          this.PropertyInfo.SetPropertyDate(this.newSysDate);
          this.UpdateInventoryAudit();
          this.SyncUpItemAndTaxes();
          this.ShowSuccessMessage();        
          if(this.propertyInfo.HasRevenuePostingEnabled)
          {
            this.SendNewSystemDate();
          }    
        } else {
          this.isProcessClicked = false;
          this.utils.ShowError(this.localization.captions.common.Error, this.captions.ErrorInDayEnd, ButtonType.Ok);
        }
        break;
      }
      case "NotifyDayEnd":
        {
          var response = <any>result.result;
          if(!response)
          {
            this.utils.ShowError(this.localization.captions.common.Error, this.captions.NotifyDayEnd, ButtonType.Ok);
          }          
          break;
        }
      case 'GetOutletsByProperty': {
        const response: any = result.result as any ? result.result : [];
        if (response) {
          this.propOutlets = response.filter(x => x.isActive);
          console.log(this.propOutlets);
        }
      }
    }
  }

  async UpdateInventoryAudit() {
    // tslint:disable-next-line: max-line-length
    this.InvokeServiceCall('UpdateInventoryAuditOnDayEnd', Host.retailManagement, HttpMethod.Post, { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) }, this.newSysDate);
  }

  async SyncUpItemAndTaxes() {
    if (!this.PropertyInfo.UseRetailInterface && this.propOutlets && this.propOutlets.length > 0) {
      this.propOutlets.forEach(element => {
        // tslint:disable-next-line: max-line-length
        this.InvokeServiceCall('SyncItemAndTax', Host.retailManagement, HttpMethod.Get, { outletId: element.subPropertyID, type: 'DayEnd', operation: 'Sync', id: 0 });
      });
    }

  }
  SendNewSystemDate()
  { 
    let obj: NotifyDayEnd = {DateTime:this.localization.convertDateObjToAPIdate(this.newSysDate)  }  
    this.InvokeServiceCall('NotifyDayEnd', Host.retailManagement, HttpMethod.Put, {},
    obj,null,null,false); 
  }

  errorCallback<T>(error: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    switch (callDesc) {
      case 'PerformDayEnd': {
        this.isProcessClicked = false;
        break;
      }
      case "NotifyDayEnd": {
        this.utils.ShowError(this.localization.captions.common.Error, this.captions.NotifyDayEnd, ButtonType.Ok);
        break;
      }
    }
  }

  async getClerkInfo(): Promise<any[]> {
    const result = await this.http.CallApiAsync({
      callDesc: 'GetAllUsers',
      method: HttpMethod.Get,
      host: Host.authentication,
      uriParams: { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) }
    });
    const response: any = result && result.result ? result.result : [];
    return response;
  }


  private async BuildOpenTransactions(response) {
    const gridData = this.GridData.find(r => r.status === PendingAction.OpenTransaction);    
    if (response && response.length > 0) {
      this.isProcessClicked = true;
      response = response.filter(r => {
        return this.utils.GetDateWithoutTime(this.utils.getDate(r.transactionDate)).getTime() === this.PropertyInfo.CurrentDate.getTime();
      });
    }
    if (!response || response.length === 0) {
      this.isProcessClicked = false;
      this.ClearGridDate(gridData);
      return;
    }
    var allClientIds = response.filter(r => r.guestId > 0).map(r => r.guestId);
    // All item info will be required when Reopen/Settle transaction from dayend
    this.InvokeServiceCall('GetShopItems', Host.retailManagement, HttpMethod.Get);
    let [clerkInfo, clients] = await Promise.all(
      [this.getClerkInfo(),
      this.getClients(allClientIds)]);

    const gridHeader = this.auditService.GetDayEndGridHeader(PendingAction.OpenTransaction);
    const gridActions = this.auditService.GetDayEndGridAction(PendingAction.OpenTransaction);
    const transactions: any[] = [];
    let transaction: any;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < response.length; i++) {
      const tran: any = response[i];
      const clerk = clerkInfo.filter(x => x.userId === tran.clerkId);
      transaction = {
        Id: tran.id,
        TicketNumber: tran.ticketNumber,
        Date: this.localization.LocalizeDate(tran.transactionDate),
        ClerkID: (clerk && clerk.length > 0) ? clerk[0].userName : '',
        Outlet: tran.outletName,
        Amount: this.FormatCurrency(tran.totalAmount),
        ClientName: this.getClientName(clients, tran.guestId),
        ClientId: tran.guestId,
        MemberName: '',
        AppointmentNumber: ''
      };
      transactions.push(transaction);
    }
    gridData.tableOptions = {
      TableHdrData: gridHeader,
      TablebodyData: transactions
    };
    gridData.options = gridActions;
    gridData.dataCount = transactions.length;
    gridData.isLoaded = true;
  }

  private FormatCurrency(amount): string {
    let formattedPrice = '';
    if (amount < 0) {
      formattedPrice = `(${this.localization.localizeCurrency(amount * -1, false)})`;
    } else {
      formattedPrice = this.localization.localizeCurrency(amount, false);
    }
    return formattedPrice;
  }

  public CanProcessDayEnd() {
    this.canProcess = false;
    const notLoadedData = this.GridData.filter(r => {
      return !r.isLoaded;
    });
    if (notLoadedData && notLoadedData.length > 0) {
      this.canProcess = false;
      return this.canProcess;
    }
    const pendingData = this.GridData.filter(r => {
      return r.dataCount > 0 && r.isLoaded;
    });
    this.canProcess = !(pendingData && pendingData.length > 0);
    return this.canProcess;
  }



  PerformDayend() {
    this.utils.ShowErrorMessage(this.captions.DAYEND, this.captions.DayEndProcess, RetailButtonType.YesNo, this.PopupCallback.bind(this));
  }


  async PopupCallback(result: string, extraParams?: any) {
    if (result.toLowerCase() == "yes") {
      this.isProcessClicked = true;
      let uriParam = { currentDate: this.currentDateForAPI };
      this.InvokeServiceCall("PerformDayEnd", Host.retailPOS, HttpMethod.Put, uriParam);
    }
  }

  ShowSuccessMessage() {
    // tslint:disable-next-line: max-line-length
    const message = `${this.captions.systemMovedTo} ${this.localization.LocalizeDate(this.newSysDate)}`;
    this.successFlag = true;
    this.canProcess = false;
    this.utils.showAlert(message, AlertType.Success, RetailButtonType.Continue);
  }
  trackByFn(index, cell) {
    return index;
  }

  // tslint:disable-next-line: max-line-length
  InvokeServiceCall(route: string, domain: Host, callType: HttpMethod, uriParams?: any, body?: any, queryString?: KeyValuePair, extraParams?: any, 
    showError: boolean = true) {
    this.http.CallApiWithCallback<any>({
      host: domain,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: route,
      method: callType,
      body,
      showError: showError,
      extraParams,
      uriParams,
      queryString
    });
  }

  private GetAppointmentStatus(status: string): string {
    let statusString = '';
    switch (status) {
      case 'RESV':
        statusString = this.AppointmentStatus.Scheduled;
        break;
      case 'CKIN':
        statusString = this.AppointmentStatus.CheckedIn;
        break;
      case 'CKOUT':
        statusString = this.AppointmentStatus.CheckedOut;
        break;
    }
    return statusString;
  }

  getStatusColor(statuscode) {
    // return this.utils.getLegendColor(this._appService, statuscode);
  }

  OpenActionsDialog(actionId: ActionType) {

  }

  private IsAuthorized(action: GridAction): boolean {
    let isUserAuthorized = true;
    const breakpointNumber: number[] = [];
    switch (action) {
      case GridAction.CheckInCheckOut:
        breakpointNumber.push(SPAScheduleBreakPoint.CheckIn_CheckOutAppointment);
        breakpointNumber.push(SPAScheduleBreakPoint.CheckInAppointment);
        breakpointNumber.push(SPAScheduleBreakPoint.CheckOutAppointment);
        break;
      case GridAction.CheckOut:
        breakpointNumber.push(SPAScheduleBreakPoint.CheckOutAppointment);
        break;
      case GridAction.Move:
        breakpointNumber.push(SPAScheduleBreakPoint.MoveAppointment);
        break;
      case GridAction.UndoCheckIn:
        breakpointNumber.push(SPAScheduleBreakPoint.UndoCheckIn);
        break;
      case GridAction.ReOpen:
      case GridAction.Settle:
      case GridAction.CancelTransaction:
        breakpointNumber.push(RetailBreakPoint.ReOpenTransaction);
        break;
    }
    if (breakpointNumber.length > 0) {
      isUserAuthorized = this.breakPoint.CheckForAccess(breakpointNumber);
    }

    if (isUserAuthorized && (action === GridAction.ReOpen || action === GridAction.Settle || action === GridAction.CancelTransaction)) {
      isUserAuthorized = !this.breakPoint.IsViewOnly(breakpointNumber[0]);
      if (!isUserAuthorized) {
        this.breakPoint.showBreakPointPopup(this.localization.captions.breakpoint[RetailBreakPoint.ReOpenTransaction]);
      }
    }

    return isUserAuthorized;
  }

  async ActionClick(option: any, data: any) {
    if (!this.IsAuthorized(option.action)) {
      return;
    }
    if (option.action === GridAction.CheckInCheckOut) {
      const params = { isNoShow: false };
      const body: number[] = [data.AppointmentId];
      this.InvokeServiceCall('CheckinAppointment', Host.schedule, HttpMethod.Put, params, body, null, [data]);
    } else if (option.action === GridAction.Move || option.action === GridAction.CheckOut) {
      this.OpenActionsDialog(this.MapAppointmentActionData(option.action, data));
    } else if (option.action === GridAction.UndoCheckOut) {
      const idList: number[] = [data.AppointmentId];
      this.InvokeServiceCall('UndoCheckOutAppointment', Host.schedule, HttpMethod.Put, '', idList);
    } else if (option.action === GridAction.UndoCheckIn) {
      const uriParam = { id: data.AppointmentId };
      this.InvokeServiceCall('UndoCheckInAppointment', Host.schedule, HttpMethod.Put, uriParam);
    } else if (option.action === GridAction.ReOpen) {
      this.retailSharedService.payeeId = data.ClientId;
      this.retailSharedService.settleOpenTransaction = false;
      this.retailSharedService.reOpenTransaction = true;
      this.retailSharedService.isReopenViewOnly = this.breakPoint.IsViewOnly(RetailBreakPoint.ReOpenTransaction);
      this.retailSharedService.transactionId = data.Id;
      if (! await this.retailValidationService.ValidateSettleReopenAction(data.Id, 'reopen', this.TransactionLockCallback.bind(this))) {
        return;
      }
      this.retailValidationService.LockTransaction(data.Id);
      // tslint:disable-next-line: max-line-length
      this.InvokeServiceCall('GetTransactionDetails', Host.retailPOS, HttpMethod.Get, { transactionId: data.Id, productId: Product.SPA }, null, null, ['reopen']);
    } else if (option.action === GridAction.Settle) {
      this.retailSharedService.payeeId = data.ClientId;
      this.retailSharedService.reOpenTransaction = false;
      this.retailSharedService.settleOpenTransaction = true;
      this.retailSharedService.transactionId = data.Id;
      if (! await this.retailValidationService.ValidateSettleReopenAction(data.Id, 'settle', this.TransactionLockCallback.bind(this))) {
        return;
      }
      this.retailValidationService.LockTransaction(data.Id);
      // tslint:disable-next-line: max-line-length
      this.InvokeServiceCall('GetTransactionDetails', Host.retailPOS, HttpMethod.Get, { transactionId: data.Id, productId: Product.SPA }, null, null, ['settle']);
    } else if (option.action === GridAction.CancelTransaction) {
      if (await this.retailValidationService.IsTransactionLocked(data.Id)) {
        this.utils.ShowError(this.localization.captions.common.Warning, this.localization.captions.shop.TransactionLock, ButtonType.Ok);
        return;
      }
      this.retailSharedService.ticketNumber = data.TicketNumber;
      this.retailSharedService.transactionId = data.Id;
      // tslint:disable-next-line: max-line-length
      this.utils.ShowError(this.localization.captions.common.Warning, this.captions.CancelOpenTransaction, ButtonType.YesNo, this.CancelTransaction.bind(this));
    }
  }

  async TransactionLockCallback(result: string, extraparams) {
    if (result.toLowerCase() === ButtonOptions.Yes.toLowerCase()) {
      this.retailValidationService.LockTransaction(extraparams[0], true);
      this.InvokeServiceCall('GetTransactionDetails',
        Host.retailPOS, HttpMethod.Get, { transactionId: extraparams[0], productId: Product.SPA }, null, null, [extraparams[1]]);
    } else {
      this.retailSharedService.settleOpenTransaction = false;
      this.retailSharedService.reOpenTransaction = false;
    }
  }


  async CancelTransaction(result) {
    if (result.toLowerCase() === 'yes') {
      this.ams.loaderEnable.next(this.localization.captions.shop.RefundInProgress);
      const response: any = await this.retailValidationService.CancelTransaction(this.retailSharedService.transactionId);
      this.ams.loaderEnable.next('');
      if (response && response.successStatus) {
        this.GetOpenTransactions();
        const undocheckoutrespone: any = await this.InvokeServiceCallAsync('UndoCheckOutAppointmentByTransactionId',
          Host.schedule, HttpMethod.Put, { transactionId: this.retailSharedService.transactionId });
        if (undocheckoutrespone && undocheckoutrespone.successStatus) {
          // this.GetCheckInAppointment();
        }
      } else {
        this.utils.ShowError(this.localization.captions.common.Information, this.localization.getError(response.result));
      }
    }
  }

  private MapAppointmentActionData(dayEndAction: GridAction, data: AppointmentData): ActionType {
    this.FillServiceData(data);
    let appointmentAction: ActionType;
    switch (dayEndAction) {
      case GridAction.CheckOut:
        this.appointmentActionHeader = this.localization.captions.bookAppointment.CheckOutAppointment;
        appointmentAction = ActionType.checkout;
        break;
      case GridAction.Move:
        this.appointmentActionHeader = this.localization.captions.bookAppointment.MoveAppointment;
        appointmentAction = ActionType.move;
        break;
    }
    return appointmentAction;
  }

  private GetManagementNamebyId(id: number, type: ManagementDataType): string {
    let name = '';
    switch (type) {
      case ManagementDataType.Location: {
        const location = this.managementData.location.find(r => r.id === id);
        if (location) {
          name = location.description;
        } else {
          name = this.localization.captions.setting.Offsite;
        }
        break;
      }
      case ManagementDataType.Service: {
        const service = this.managementData.service.find(r => r.id === id);
        if (service) {
          name = service.description;
        }
        break;
      }
      case ManagementDataType.Package: {
        const packageData = this.managementData.package.find(r => r.id === id);
        if (packageData) {
          name = packageData.description;
        }
        break;
      }
      case ManagementDataType.Client: {
        const client = this.managementData.client.find(r => r.id === id);
        if (client) {
          name = `${client.firstName} ${client.lastName}`;
        }
      }
        break;
    }
    return name;
  }

  private GetTherapistName(id: number[]): string {
    const name: string[] = [];
    const therapist = this.managementData.therapist.filter(r => id.includes(r.id));
    if (therapist && therapist.length > 0) {
      therapist.forEach(t => {
        name.push(`${t.firstName} ${t.lastName}`);
      });
    }
    return name.join(',');
  }

  async BuildTransactionDetails(result, action: string) {
    this.retailSharedService.selectedProducts = await this.retailValidationService.LoadSelectedProducts(result, this.allShopItems, action);
    this.retailSharedService.isFromDayEnd = true;
    this.retailSharedService.TaxValue = _.cloneDeep(this.retailValidationService.TaxValue);
    this.retailValidationService.TaxValue = 0;
    this.retailSharedService.GoToRetailTransaction = false;
    if (!this.retailSharedService.SelectedOutletId && result && result.length > 0) {
      this.retailSharedService.SelectedOutletId = result[0].outletId;
    }
    this.retailSharedService.propertyDate = this.PropertyInfo.CurrentDate;
    this.retailSharedService.useRetailInterface = this.PropertyInfo.UseRetailInterface;
    if (this.retailSharedService.settleOpenTransaction) {
      this.utils.RedirectTo(RedirectToModules.order);
    } else if (this.retailSharedService.reOpenTransaction) {
      this.utils.RedirectTo(RedirectToModules.retail);
    }
  }

  private FillServiceData(data: AppointmentData) {
  }

  private ClearGridDate(gridData) {
    gridData.tableOptions = {
      TableHdrData: [],
      TablebodyData: []
    };
    gridData.dataCount = 0;
  }

  private ResetServiceObject() {
    this.retailSharedService.isFromDayEnd = false;
    this.retailSharedService.reOpenTransaction = false;
    this.retailSharedService.isReopenViewOnly = false;
    this.retailSharedService.settleOpenTransaction = false;
  }

  async InvokeServiceCallAsync(route: string, domain: Host, callType: HttpMethod, uriParams?: any, body?: any): Promise<BaseResponse<any>> {
    const result: BaseResponse<any> = await this.http.CallApiAsync({
      host: domain,
      callDesc: route,
      method: callType,
      body,
      uriParams,
    });
    return result;
  }
  private async getClients(clientId: number[]): Promise<any[]> {
    let result: any[] = [];
    if (clientId && clientId.length > 0) {
      clientId = Array.from(new Set(clientId)); // Unique
      let clientResponse: BaseResponse<any[]> = await this.InvokeServiceCallAsync("GetClientByIds", Host.retailPOS, HttpMethod.Put, { includeRelatedData: false }, clientId)
      if (clientResponse.result) {
        result = clientResponse.result;
      }
    }
    return result;
  }

  private getClientName(allClinets: any[], clientId: number): string {
    let clientName = '';
    if (allClinets && allClinets.length > 0) {
      var client = allClinets.find(r => r.id == clientId);
      if (client) {
        clientName = `${client.firstName} ${client.lastName}`
      }
    }
    return clientName;
  }

}
