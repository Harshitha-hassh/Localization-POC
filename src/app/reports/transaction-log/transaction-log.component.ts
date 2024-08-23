import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ReportOptions, Users, TranslogType } from '../business/report.modals';
import { translog } from '../business/translogTypes';
import * as _ from "lodash";
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { Utilities } from 'src/app/core/utilities';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { BaseResponse } from 'src/app/retail/shared/shared.modal';
import { Host } from 'src/app/retail/shared/globalsContant';
import { HttpMethod, HttpServiceCall } from 'src/app/retail/shared/service/http-call.service';
import { routingMenuService } from 'src/app/common/components/menu/menu.service';
@Component({
  selector: 'app-transaction-log',
  templateUrl: './transaction-log.component.html',
  styleUrls: ['./transaction-log.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransactionLogComponent implements OnInit {

  public tableoptions: any;
  public transactionData: any;
  public logType: TranslogType[];
  public users: Users[] = [];
  public transactionForm: UntypedFormGroup;
  public captions: any;
  public commonCaptions: any;
  public navbarStatus: boolean = false;
  public showIncludeTemp:boolean =false;
  public minDate: Date = null;
  public maxDate: Date = this.PropertyInfo.CurrentDate;
  public isAuditReport = false;
  showError: boolean = false;
  disableSearchBtn: boolean = false;
  floatLabel: string;
  transactionHeader: any = [{ title: "Log Date", jsonkey: "logDate", alignType: "left" },
  { title: "Type", jsonkey: "type", alignType: "left" }, { title: "Description", jsonkey: "description", alignType: "left" },
  { title: "User ID", jsonkey: "userId", alignType: "left" }, { title: "Appointment #", jsonkey: "appointment", alignType: "left" },
  { title: "Transaction #", jsonkey: "transaction", alignType: "left" }, { title: "Client Name", jsonkey: "clientName", alignType: "left" }];
  placeholderFormat: string;
  constructor(private fb: UntypedFormBuilder, private http: HttpServiceCall, private utils: Utilities, private localization: RetailStandaloneLocalization,
    private PropertyInfo: PropertyInformation,private _routingMenuService:routingMenuService) {
    this.logType = translog;
    this.floatLabel = this.localization.setFloatLabel;
  }

  async getTransactionData() {
    // this.transactionData = await this._rs.getTransactionLog().toPromise();
    this.populateTableInfo();
  }

  populateTableInfo(): void {
    this.tableoptions = [{
      TableHdrData: this.transactionHeader,
      TablebodyData: this.transactionData,
      pagination: false,
      sortable: false,
      CustomColumn: true,
      TableSearchText: '',
      PlaceHoldertext: '',
      EnableActions: false,
      TableDraggable: false,
      Searchable: false,
      SelectedSettingId: 'transactionLog',
      enableKey: true,
      moreText: 'Show More',
      lessText: 'Show Less'
    }];
  }

  asideArrow(e?:any):void {
    this.navbarStatus = !this.navbarStatus;
  }

  resetSearch(event?:any):void {
    const currentreport: string = this.transactionForm.controls.logType.value;
    this.transactionForm.reset();
    this.showIncludeTemp=false;
    this.transactionForm.controls.logType.setValue(currentreport);
    let currentDate = this.PropertyInfo.CurrentDate;
    this.transactionForm.controls.date.setValue(currentDate);
  }

  searchReport(event?:any):void {
    if (this.validateEntries()) {
      let _params: ReportOptions = this.formReportParams();
      this.reportOption = _params;
    }

  }

  selectionChange(evt: any) {
    if (evt.value == 'AuditReport') {
      this.isAuditReport = true;
      this.maxDate = null;
      this.minDate = this.PropertyInfo.CurrentDate;
    }
    else {
      this.isAuditReport = false;
      this.minDate = null;
      this.maxDate = this.PropertyInfo.CurrentDate;
    }
  }
  
  formReportParams(): ReportOptions {
    let ctl = this.transactionForm.controls;
    let toApi = this.localization.convertDateObjToAPIdate;
    let _logDate = ctl["date"].value != null && ctl["date"].value != "" ? toApi(ctl["date"].value) : null;
    let _propertyName = this.localization.GetPropertyInfo("PropertyName");
    const userPreferredLang = this.localization.GetPropertyInfo('UserLanguage');
    const preferredLanguage = userPreferredLang !== '' ? userPreferredLang : this.localization.GetPropertyInfo('Language');
    if (this.isAuditReport) {
      return {
        code: "AuditReport",
        params: [{ "pPropertyName": _propertyName },
        { "pDate": this.localization.ConvertDateToISODateTime(new Date()) },
        { "pReportDate": _logDate }        
        ],
        URIParams: [{ "StartDate": _logDate }],
        Filter: [],
        pageBreak: false,
        layout: "Portrait",
        language: preferredLanguage
      };
    } else {
    let params: ReportOptions = {
      code: "RetailTransLog",
      params: [ {"pPropertyName":_propertyName},
              { "pDate" : this.localization.ConvertDateToISODateTime(new Date()) },
              { "pFilterDate": _logDate},
              { "pTransactionNumber": ctl["transactionNumber"].value},
              { "pUserId": ctl["userID"].value},
              { "pClientFirstName": ctl["firstName"].value},
              { "pClientLastName": ctl["lastName"].value},
              { "pAppointmentNumber": ctl["appointmentNumber"].value},
              { "pIncludeTempAppointment": ctl["includetempappointment"].value}
            ],
      URIParams: [{ "FirstName": ctl["firstName"].value }, { "LastName": ctl["lastName"].value },
      { "UserId": ctl["userID"].value }, { "TransactionId": ctl["transactionNumber"].value },
      { "appointmentId": ctl["appointmentNumber"].value }, { "LogDate": _logDate },
      { "LogType": ctl["logType"].value },{"IncludeTempAppointment":ctl["includetempappointment"].value}
      ],
      Filter: [],
      pageBreak: false,
      layout: "Portrait",
      language: preferredLanguage
      }
    return params;  
    }
  }

  // private ctlValue(ctrl: string): string {
  //   return this.transactionForm.controls[ctrl].value
  // }

  async ngOnInit() {
    this.placeholderFormat = this.localization.inputDateFormat;
    let currentDate = this.PropertyInfo.CurrentDate;
    this.transactionForm = this.fb.group({
      logType: [''],
      transactionNumber: [''],
      startDate: [''],
      endDate: [''],
      firstName: [''],
      lastName: [''],
      date: [currentDate],
      appointmentNumber: [''],
      includetempappointment:false,
      userID: ['']
    })
    this.captions = this.localization.captions.reports;
    this.commonCaptions = this.localization.captions.common;
    this.getTransactionData();
    this.users=await this.GetAllUsers();  
    let selectedMenuTxt = this._routingMenuService.selectedRoutingMenu?.text;
    let selectedLogType;
    if(selectedMenuTxt){
      selectedLogType = this.logType.find(x => x.logtype == selectedMenuTxt)?this.logType.find(x => x.logtype == selectedMenuTxt):this.logType[0];
      this.transactionForm.valueChanges.subscribe(a => this.validateEntries());
      this.transactionForm.controls.logType.setValue(selectedLogType.code);     
      const logSelection = { value: selectedLogType.code };      
      await this.selectionChange(logSelection);
    }
    else{
       this.transactionForm.valueChanges.subscribe(a => this.validateEntries());
       this.transactionForm.controls.logType.setValue(this.logType[0].code);
    }    
    
  }

  

  async GetAllUsers(): Promise<Users[]> {
    const result = await this.http.CallApiAsync({
      callDesc: 'GetAllUsers',
      method: HttpMethod.Get,
      host: Host.authentication,
      uriParams:{ tenantId: Number(this.utils.GetPropertyInfo('TenantId')) }
    });
    const response: any = result && result.result ? result.result : [];
   return this.users= _.orderBy(response, [response => response.userName.toLowerCase()], 'asc');   
  }

  private validateEntries(): boolean {
    let IsValid: boolean = Object.values(this.transactionForm.value).filter(value => (value != "" && value != null)).length > 0;
    this.showError = !IsValid;
    this.disableSearchBtn = this.showError;
    this.showTempAppointmentToggle();
    return IsValid;
  }

  showTempAppointmentToggle()
  {
    if(this.transactionForm.value.logType=="" ||this.transactionForm.value.logType==null ||this.transactionForm.value.logType=="AppointmentCreate"||this.transactionForm.value.logType=="AppointmentEdit"){
      this.showIncludeTemp = true;
    }else{
      this.showIncludeTemp=false;
    }
  }


  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void { }
  reportOption: ReportOptions;
  //event from fast report component for disabling generate button when API call is in progress
  disableGenerateButtonEvent(IsEnable:boolean) {
    this.disableSearchBtn = IsEnable;
  }

  changeToggleEvent(event) {
    if (event[0]) {
    this.transactionForm.controls['includetempappointment'].setValue(true);
    }else{
      this.transactionForm.controls['includetempappointment'].setValue(false);
    }
  }


}
