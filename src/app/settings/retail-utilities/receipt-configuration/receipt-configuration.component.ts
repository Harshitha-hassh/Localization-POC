import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { Outlet, ReceiptModel,PropertyReceiptModel, PropertyConfigurationModel } from '../../../retail/retail.modals';
import { ReceiptConfigurationDataService } from './receipt-configuration-data';
import { RetailOutletsDataService } from '../../../retail/retail-code-setup/retail-outlets/retail-outlets-data.service';
import { RetailBreakPoint, ButtonType } from 'src/app/common/shared/shared/globalsContant';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';

@Component({
  selector: 'app-receipt-configuration',
  templateUrl: './receipt-configuration.component.html',
  providers: [ReceiptConfigurationDataService, RetailOutletsDataService],
  styleUrls: ['./receipt-configuration.component.scss']
})

export class ReceiptConfigurationComponent implements OnInit {

  [x: string]: any;
  printReceiptArray: any;
  FormGrp: FormGroup;
  textCaptions: any;
  printInfo: any;
  Outlet: Outlet[];
  OutletInfo: ReceiptModel[];
  selectedOutletId: number;
  IsViewOnly: boolean;
  isSaveDisabled: boolean;
  ServiceCharge: any;
  userPrintValue:any;
  userPrintControls:number[];
  isSuppressClerk: boolean;
  isSuppressPrint: boolean;
  selctedClerkById: number;
  selctedPrintById: number;
  DisplayAuthCode:boolean;
  AuthCodeConfiguration:PropertyReceiptModel[];
  propertyId: number;

  constructor(private Form: FormBuilder,
              private breakPoint: BreakPointAccess,
              private localization: RetailStandaloneLocalization,
              private data: ReceiptConfigurationDataService,
              private outletData: RetailOutletsDataService, private utils: RetailUtilities) {
    this.textCaptions = this.localization.captions.utilities;
    this.FormGrp = this.Form.group({
      outlet: ['', Validators.required],
      // #46309 - Hide unused fields
      noOfReceipts: [''],
      // noOfReceipts: ['', Validators.required],
      displayServiceCharge: ['1', Validators.required],
      gratuityLine: [''],
      receiptNote: [''],
      printReceipt: this.Form.array([this.addPrintDetails()])
    });
    this.propertyForm = this.Form.group({
      displayAuthcode: [''],
      authcodeName: ['']
    })
  }

  async ngOnInit() {
    this.textCaptions = this.localization.captions.utilities;
    this.DisplayAuthCode=false;
    this.ServiceCharge = [
      { id: 1, value: this.textCaptions.Details },
      { id: 2, value: this.textCaptions.SummarySplit },
      { id: 3, value: this.textCaptions.SummaryCombine }
    ];
    this.Outlet = await this.outletData.getOutlets();
    this.Outlet = this.Outlet.filter(x => x.isActive == true);
    this.OutletInfo = await this.data.getOutletInfo();
    this.printInfo = [
      { id: 1, Name: this.textCaptions.DisplayDisOnReceipt, controlName: 'discountOnReceipt', enableToggle: true },
      // { id: 2, Name: this.textCaptions.DisplayPackageItemDesc, controlName: 'packItemDesc', enableToggle: true },
      { id: 3, Name: this.textCaptions.AddSecondLine, controlName: 'addSecondLine', enableToggle: true },
      // { id: 4, Name: this.textCaptions.PackItemPrice, controlName: 'packItemPrice', enableToggle: false },
      // { id: 5, Name: this.textCaptions.PackItemOnReceipt, controlName: 'packageItemOnReceipt', enableToggle: true },
      // { id: 6, Name: this.textCaptions.PackAppID, controlName: 'packAppId', enableToggle: false },
      { id: 7, Name: this.textCaptions.SurplusClerkID, controlName: 'surplusClientIdOnReceipt', enableToggle: true },
      // { id: 8, Name: this.textCaptions.PackItemStaffCode, controlName: 'packStaffCode', enableToggle: false },
      { id: 9, Name: this.textCaptions.SurplusPrintedBy, controlName: 'surplusPrintedByOnReceipt', enableToggle: true },
    ];

    this.userPrintValue = [
      {id:1, Name:this.textCaptions.userId, controlName: 'userId', value: 0},
      {id:2, Name:this.textCaptions.fullName, controlName: 'fullName', value: 1},
      {id:3, Name:this.textCaptions.firstName, controlName: 'firstName', value: 2},
      {id:4, Name:this.textCaptions.lastName, controlName: 'lastName', value: 3}
    ]
      this.isSuppressClerk = true;
    this.isSuppressPrint =true;
    this.breakPoint.CheckForAccess([RetailBreakPoint.ReceiptConfiguration], false);
    if (this.breakPoint.IsViewOnly(RetailBreakPoint.ReceiptConfiguration)) {
      this.IsViewOnly = true;
      this.FormGrp.controls['noOfReceipts'].disable();
      this.FormGrp.controls['gratuityLine'].disable();
      this.FormGrp.controls['receiptNote'].disable();
      this.printInfo.map(x => x.enableToggle = false);
    }
    this.isSaveDisabled = true;
    this.getPropertyReceiptConfig();
  }

  changeSelection(e) {
    this.isSaveDisabled = true;
    this.selectedOutletId = e.value;
    const selectedValues = this.OutletInfo.filter(x => x.outletId == e.value);
    if (selectedValues.length == 0) {
      this.resetData();
      this.cancelClick();
      this.FormGrp.get('outlet').setValue(this.selectedOutletId);
    } else {
      this.bindGridData(selectedValues);
    }
  }

  bindGridData(selectedValues) {
    // const selectedOutlet = this.Outlet.filter(x => x.id == this.selectedOutletId);
    const printReceiptCustom: any = {
      discountOnReceipt: selectedValues[0].displayDiscount,
      addSecondLine: selectedValues[0].addSecondLine,
      packageItemOnReceipt: selectedValues[0].displayOnlyPackageItem,
      surplusClientIdOnReceipt: selectedValues[0].suppressClerkId,
      packItemDesc: selectedValues[0].displayPackageDescription,
      packItemPrice: selectedValues[0].displayPackagePrice,
      packAppId: selectedValues[0].displayPackageAppointmentID,
      packStaffCode: selectedValues[0].displayPackageStaffCode,
      surplusPrintedByOnReceipt:  selectedValues[0].suppressPrintedBy,
      clerkIdPrintValue:  selectedValues[0].clerkIdPrintValue,
      printedByPrintValue:  selectedValues[0].printedByPrintValue,
    };

    this.FormGrp.get('outlet').setValue(selectedValues[0].outletId);
    this.FormGrp.get('noOfReceipts').setValue(selectedValues[0].numberOfReceipts);
    this.FormGrp.get('displayServiceCharge').setValue(selectedValues[0].serviceChargeGratuityDisplay);
    this.FormGrp.get('gratuityLine').setValue(selectedValues[0].gratuityLine);
    this.FormGrp.get('receiptNote').setValue(selectedValues[0].receiptNote);
    this.printReceiptArray = this.FormGrp.get('printReceipt') as FormArray;
    this.printReceiptArray.removeAt(0);
    const x = this.savePrintDetails(printReceiptCustom);
    this.printReceiptArray.push(x);
    if (selectedValues[0].displayPackageDescription && !this.IsViewOnly) {
      this.printInfo[3].enableToggle = true;
      this.printInfo[5].enableToggle = true;
      this.printInfo[7].enableToggle = true;
    }
    if (selectedValues[0].displayOnlyPackageItem) {
      this.printInfo[1].enableToggle = false;
      this.printInfo[3].enableToggle = false;
      this.printInfo[5].enableToggle = false;
      this.printInfo[7].enableToggle = false;
    }
    if (selectedValues[0].suppressClerkId == false || selectedValues[0].suppressPrintedBy == false) {
      this.isSuppressClerk = true;
      this.isSuppressPrint = true;
    }
    if (selectedValues[0].displayOnlyPackageItem == false) {
      if (selectedValues[0].displayPackageDescription) {
        this.printInfo[3].enableToggle = true;
        this.printInfo[5].enableToggle = true;
        this.printInfo[7].enableToggle = true;
      }
      // this.printInfo[1].enableToggle = true;      
    }
    if (selectedValues[0].suppressClerkId == true) {
      this.isSuppressClerk = false;
    }
    if ( selectedValues[0].suppressPrintedBy == true) {
      this.isSuppressPrint = false;
    }
    
  }

  addPrintDetails(): FormGroup {
    return this.Form.group({
      discountOnReceipt: '',
      addSecondLine: '',
      packageItemOnReceipt: '',
      surplusClientIdOnReceipt: '',
      packItemDesc: '',
      packItemPrice: '',
      packAppId: '',
      packStaffCode: '',
      surplusPrintedByOnReceipt:'',
      surplusClientIdOnReceiptbyName: '',
      surplusPrintedByOnReceiptbyName: ''
      
    });
  }
  savePrintDetails(data): FormGroup {
    return this.Form.group({
      discountOnReceipt: data.discountOnReceipt,
      addSecondLine: data.addSecondLine,
      packageItemOnReceipt: data.packageItemOnReceipt,
      surplusClientIdOnReceipt: data.surplusClientIdOnReceipt,
      packItemDesc: data.packItemDesc,
      packItemPrice: data.packItemPrice,
      packAppId: data.packAppId,
      packStaffCode: data.packStaffCode,
      surplusPrintedByOnReceipt: data.surplusPrintedByOnReceipt,
      surplusClientIdOnReceiptbyName: data.clerkIdPrintValue,
      surplusPrintedByOnReceiptbyName: data.printedByPrintValue
    });
  }

  radioSelect(value, controlName) {
    this.isSaveDisabled = false;
    let controlname = ""
    if(controlName == "surplusClientIdOnReceipt")
    {
      this.selctedClerkById =  value;
      controlname = controlName + 'byName';
    }
    if(controlName == "surplusPrintedByOnReceipt")
    {
      this.selctedPrintById = value;
      controlname = controlName + 'byName';
    }
    this.FormGrp.get('printReceipt')['controls'][0].get(controlname).setValue(value);
  }

  toggleChange(event, controlName) {
    this.isSaveDisabled = false;
    if (controlName == 'packItemDesc' && event[0] && !this.IsViewOnly) {
      this.printInfo[3].enableToggle = true;
      this.printInfo[5].enableToggle = true;
      this.printInfo[7].enableToggle = true;
    } else if (controlName == 'packItemDesc' && !event[0]) {
      this.printInfo[3].enableToggle = false;
      this.printInfo[5].enableToggle = false;
      this.printInfo[7].enableToggle = false;
    } 
    else if ((controlName == 'surplusClientIdOnReceipt') && event[0] == false) {
      this.isSuppressClerk = true;
    }
    else if ((controlName == 'surplusPrintedByOnReceipt') && event[0] == false) {
      this.isSuppressPrint = true;
    }
    else if ((controlName == 'surplusClientIdOnReceipt' ) && event[0] == true) {
      this.isSuppressClerk = false;
    }
    else if ((controlName == 'surplusPrintedByOnReceipt') && event[0] == true) {
      this.isSuppressPrint = false;
    }
    else if (controlName == 'packageItemOnReceipt' && event[0]) {
      this.printInfo[1].enableToggle = false;
      // this.FormGrp.controls[0].value.packItemDesc = false;
      // this.FormGrp.controls.printReceipt.value[0].packItemDesc = false;
      this.printInfo[3].enableToggle = false;
      this.printInfo[5].enableToggle = false;
      this.printInfo[7].enableToggle = false;
    } else if (controlName == 'packageItemOnReceipt' && !event[0] && !this.IsViewOnly) {
      if (this.FormGrp.controls.printReceipt.value[0].packItemDesc) {
        this.printInfo[3].enableToggle = true;
        this.printInfo[5].enableToggle = true;
        this.printInfo[7].enableToggle = true;
      }
      this.printInfo[1].enableToggle = true;
    }
    this.FormGrp.get('printReceipt')['controls'][0].get(controlName).setValue(event[0]);

  }

  viewChange(e) {
    this.isSaveDisabled = false;
  }

  cancelClick() {
    this.FormGrp.reset();
    this.FormGrp.get('displayServiceCharge').setValue(1);
    this.propertyForm.reset();
    this.getPropertyReceiptConfig();
  }

  async saveReceipt(data: any) {
    console.log(data);
    const receiptobj: ReceiptModel = {
      id: 0,
      outletId: this.selectedOutletId,
      numberOfReceipts: data.noOfReceipts || 0,
      displayDiscount: data.printReceipt[0].discountOnReceipt ? true : false,
      addSecondLine: data.printReceipt[0].addSecondLine ? true : false,
      displayOnlyPackageItem: data.printReceipt[0].packageItemOnReceipt ? true : false,
      suppressClerkId: data.printReceipt[0].surplusClientIdOnReceipt ? true : false,
      displayPackageDescription: data.printReceipt[0].packItemDesc ? true : false,
      displayPackagePrice: data.printReceipt[0].packItemPrice ? true : false,
      displayPackageAppointmentID: data.printReceipt[0].packAppId ? true : false,
      displayPackageStaffCode: data.printReceipt[0].packStaffCode ? true : false,
      serviceChargeGratuityDisplay: data.displayServiceCharge,
      gratuityLine: data.gratuityLine,
      receiptNote: data.receiptNote,
      suppressPrintedBy: data.printReceipt[0]. surplusPrintedByOnReceipt ? true : false,
      clerkIdPrintValue: data.printReceipt[0].surplusClientIdOnReceiptbyName ? data.printReceipt[0].surplusClientIdOnReceiptbyName : 0,
      printedByPrintValue: data.printReceipt[0].surplusPrintedByOnReceiptbyName ? data.printReceipt[0].surplusPrintedByOnReceiptbyName :0
    };
    this.OutletInfo = await this.data.createReceipt(receiptobj);
    const currOutlet = this.Outlet.filter(x => x.id == this.selectedOutletId);
    this.utils.ShowError(this.textCaptions.Success, this.textCaptions.AfterSaveMessage + currOutlet[0].outletName, ButtonType.Ok);
    this.resetData();
  }

  resetData() {
    this.isSaveDisabled = true;
  }
  toggleAction(event) {
    if (event == false) {
      this.DisplayAuthCode=false;
      this.propertyForm.controls["authcodeName"].setValidators(Validators.required);
      this.propertyForm.controls["authcodeName"].updateValueAndValidity();
    }
    else {
      this.DisplayAuthCode=true;
      this.propertyForm.controls["authcodeName"].clearValidators();
      this.propertyForm.controls["authcodeName"].updateValueAndValidity();
    }
    this.isSaveDisabled=false;
  }
async getPropertyReceiptConfig()
{
  this.PropertyReceiptInfo = await this.data.getPropertyReceiptConfig(); 
  if(this.PropertyReceiptInfo && this.PropertyReceiptInfo.id)
  {
    let authCode = this.PropertyReceiptInfo.configValue.authCodeReceiptName != "" ? 
     this.PropertyReceiptInfo.configValue.authCodeReceiptName : this.PropertyReceiptInfo.defaultValue.authCodeReceiptName;

     let displayAuthCode = this.PropertyReceiptInfo.configValue.displayAuthCode != false ?  
     this.PropertyReceiptInfo.configValue.displayAuthCode : this.PropertyReceiptInfo.defaultValue.displayAuthCode;
     if(displayAuthCode == true)
    {
      this.DisplayAuthCode=true;
      this.propertyForm.controls["authcodeName"].setValue(authCode);
      this.propertyForm.controls["displayAuthcode"].setValue(displayAuthCode);
      this.propertyform.markAsPristine();
    }
    else
    {
      this.propertyForm.controls["displayAuthcode"].setValue(displayAuthCode);
      this.propertyForm.controls["authcodeName"].setValue(authCode);
      this.propertyform.markAsPristine();
    }
  }
}

  async saveReceiptProperty(data: any) {
    console.log(data);
    if(this.PropertyReceiptInfo && this.PropertyReceiptInfo.id > 0)
    {
      let Propertyreceiptobj: PropertyReceiptModel = {
        id: this.PropertyReceiptInfo.id,
        screenName: "ReceiptConfiguration",//ScreenName.ReceiptConfiguration,
        moduleName : "Utilities",//ModuleName.Utilities,
        configValue: JSON.stringify(this.formConfigValue(data)),
        defaultValue: JSON.stringify(this.formDefaultValue(data))
      } 
      //Update call
      let result = await this.data.updatePropertyConfig(Propertyreceiptobj);
    }
    else{
      let Propertyreceiptobj: PropertyReceiptModel = {
        id: 0,
        screenName: "ReceiptConfiguration",//ScreenName.ReceiptConfiguration,
        moduleName : "Utilities",//ModuleName.Utilities,
        configValue: JSON.stringify(this.formConfigValue(data)),
      defaultValue: JSON.stringify(this.formDefaultValue(data))
      }
      this.PropertyReceiptInfo = await this.data.createPropertyConfig(Propertyreceiptobj);
    } 
    this.utils.ShowError(this.textCaptions.Success, this.textCaptions.AfterSaveMessage + "the Property", ButtonType.Ok);
   
    this.resetData();
  }

  formConfigValue(data: any)
  {
    let configValue : PropertyConfigurationModel = {
      displayAuthCode: data.displayAuthcode,
      AuthCodeReceiptName: data.authcodeName
    }
    return configValue;
  }
  formDefaultValue(data: any)
  {
    let defaultValue : PropertyConfigurationModel = {
      displayAuthCode: false,
      AuthCodeReceiptName: "Auth Code"
    }
    return defaultValue;
  }
}
