import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray } from '@angular/forms';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { Outlet, ReceiptModel,PropertyReceiptModel, PropertyConfigurationModel, ImgType, receiptImageConfiguration, RetailImgRefType } from '../../../retail/retail.modals';
import { ReceiptConfigurationDataService } from './receipt-configuration-data';
import { RetailOutletsDataService } from '../../../retail/retail-code-setup/retail-outlets/retail-outlets-data.service';
import { RetailBreakPoint, ButtonType } from 'src/app/common/shared/shared/globalsContant';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { AgToggleConfig, DropdownOptions } from 'src/app/common/Models/ag-models';
import { AlertType, Imagedata } from 'src/app/shared/shared-models';
import { ImageDataService } from 'src/app/shared/data-services/Image/image.data.services';
import { DEFAULT_IMAGE_REFERENCE_ID } from 'src/app/app-constants';

@Component({
  selector: 'app-receipt-configuration',
  templateUrl: './receipt-configuration.component.html',
  providers: [ReceiptConfigurationDataService, RetailOutletsDataService],
  styleUrls: ['./receipt-configuration.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ReceiptConfigurationComponent implements OnInit {

  [x: string]: any;
  printReceiptArray: any;
  FormGrp: UntypedFormGroup;
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
  floatLabel: string;
  displayChangeDue: boolean;
  printGiftToggleInputs: AgToggleConfig;
  authCodeToggleInputs: AgToggleConfig;
  changeDueToggleInputs: AgToggleConfig;
  settlementReceiptToggleInputs: AgToggleConfig;
  displayImageInReceiptFooterInput : AgToggleConfig;
  displayPropertyLogoInReceiptHeaderInput : AgToggleConfig;
  isImageRemoved: boolean;
  ImageUploaded: boolean;
  imagePositionOptions: DropdownOptions[];
  displayImageInReceiptHeader:boolean;
  displayImageInReceiptFooter:boolean;
  base64textString: string;
  thumbnailImg: any;
  footerUrl: string;
  headerImageReferenceId?: string;
  footerImageReferenceId?: string;
  headerImageUploaded: boolean;
  footerImageUploaded: boolean;
  headerUrl: string;
  GroupByTaxNameToggleInputs: AgToggleConfig;
  constructor(private Form: UntypedFormBuilder,
              private breakPoint: BreakPointAccess,
              public localization: RetailStandaloneLocalization,
              private data: ReceiptConfigurationDataService,
              private outletData: RetailOutletsDataService, private utils: RetailUtilities,private imgService: ImageDataService) {
    this.textCaptions = this.localization.captions.utilities;
    this.floatLabel = this.localization.setFloatLabel;
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
      printGiftReceipt:[''],
      displayAuthcode: [''],
      authcodeName: [''],
      displayChangeDue: [''],
      receiptFooterNote: [''],
      printPendingSettlementReceipt: [''],
      displayImageInReceiptHeader: [false],
      displayImageInReceiptFooter: [false],
      headerimagedata: false,
      footerimagedata: false,
      headerImageReferenceId: DEFAULT_IMAGE_REFERENCE_ID,
      footerImageReferenceId:DEFAULT_IMAGE_REFERENCE_ID,
      propertyImageAlign: '0',
      receiptImageFooterNote: [''],
      groupByTaxName:[false]
    })
  }

  async ngOnInit() {
    this.textCaptions = this.localization.captions.utilities;
    this.DisplayAuthCode=false;
    this.displayChangeDue= false;
    this.displayImageInReceiptHeader=false;
    this.displayImageInReceiptFooter=false;
    this.ServiceCharge = [
      { id: 1, value: this.textCaptions.Details },
      { id: 2, value: this.textCaptions.SummarySplit },
      { id: 3, value: this.textCaptions.SummaryCombine }
    ];
    this.printGiftToggleInputs = {
      group: this.propertyForm,
      formControlName: 'printGiftReceipt',
      automationId:"'Tog_ReceiptConfiguration_printGiftReceipt'"
    }
    this.authCodeToggleInputs = {
      group: this.propertyForm,
      formControlName: 'displayAuthcode',
      automationId:"'Tog_ReceiptConfiguration_displayAuthcode'"
    }
    this.changeDueToggleInputs = {
      group: this.propertyForm,
      formControlName: 'displayChangeDue',
      automationId:"'Tog_ReceiptConfiguration_displayChangeDue'"
    }
    this.settlementReceiptToggleInputs = {
      group: this.propertyForm,
      formControlName: 'printPendingSettlementReceipt',
      automationId:"'Tog_ReceiptConfiguration_printPendingSettlementReceipt'"
    }
    this.displayImageInReceiptFooterInput = {
      group: this.propertyForm,
      horizontal: true,
      formControlName: 'displayImageInReceiptFooter',
      automationId : 'Tog_ReceiptConfiguration_displayImageInReceiptFooter' 
    }
    this.displayPropertyLogoInReceiptHeaderInput = {
      group: this.propertyForm,
      horizontal: true,
      formControlName: 'displayImageInReceiptHeader',
      automationId : 'Tog_ReceiptConfiguration_displayPropertyLogoInReceiptHeader' 
    }
    this.GroupByTaxNameToggleInputs = {
      group: this.propertyForm,
      formControlName: 'groupByTaxName',
      automationId:'Tog_ReceiptConfiguration_groupByTaxName'
    }
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
    this.printReceiptArray = this.FormGrp.get('printReceipt') as UntypedFormArray;
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

  addPrintDetails(): UntypedFormGroup {
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
  savePrintDetails(data): UntypedFormGroup {
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
    let message = this.localization.replacePlaceholders(this.textCaptions.AfterSaveMessage, ['message'], [currOutlet[0].outletName]);
    this.utils.showAlert(message, AlertType.WellDone);
    this.resetData();
  }

  resetData() {
    this.isSaveDisabled = true;
    this.propertyForm.markAsPristine();
  }
  toggleAction(event) {
    if (event.checked == false) {
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
  toggleChangeDueAction(event) {
    if (event.checked == false) {
      this.DisplayChangeDue=false;
      
    }
    else {
      this.DisplayChangeDue=true;
      
    }
  }
  displayImageInReceiptFooterToggleAction(event) {
    if (event == false) {
      this.displayImageInReceiptFooter=false;
    }
    else {
      this.displayImageInReceiptFooter=true;
    }
  }
  displayPropertyLogoInReceiptHeaderToggleAction(event) {
    if (event == false) {
      this.displayImageInReceiptHeader=false;
    }
    else {
      this.displayImageInReceiptHeader=true;
    }
  }
async getPropertyReceiptConfig()
{
  this.PropertyReceiptInfo = await this.data.getPropertyReceiptConfig(); 
  if(this.PropertyReceiptInfo && this.PropertyReceiptInfo.id)
  {
    let authCode = this.PropertyReceiptInfo.configValue.authCodeReceiptName != "" ? 
     this.PropertyReceiptInfo.configValue.authCodeReceiptName : this.PropertyReceiptInfo.defaultValue.authCodeReceiptName;
     let receiptFooterNote = this.PropertyReceiptInfo.configValue.receiptFooterNote != "" ? 
     this.PropertyReceiptInfo.configValue.receiptFooterNote : "";
     let displayAuthCode = this.PropertyReceiptInfo.configValue.displayAuthCode != false ?  
     this.PropertyReceiptInfo.configValue.displayAuthCode : this.PropertyReceiptInfo.defaultValue.displayAuthCode;
     let displayChangeDue= this.PropertyReceiptInfo.configValue.displayChangeDue != false ?  
     this.PropertyReceiptInfo.configValue.displayChangeDue : this.PropertyReceiptInfo.defaultValue.displayChangeDue;
     let printGiftReceipt = this.PropertyReceiptInfo.configValue.printGiftReceipt != null ? this.PropertyReceiptInfo.configValue.printGiftReceipt : false;
     let printPendingSettlementReceipt = this.PropertyReceiptInfo.configValue.printPendingSettlementReceipt != null ? this.PropertyReceiptInfo.configValue.printPendingSettlementReceipt : false;
     let groupByTaxName = this.PropertyReceiptInfo.configValue.groupByTaxName != null ? this.PropertyReceiptInfo.configValue.groupByTaxName : false;
     this.propertyForm.controls["displayChangeDue"].setValue(displayChangeDue);
     this.propertyForm.controls["receiptFooterNote"].setValue(receiptFooterNote);
     this.propertyForm.controls["printGiftReceipt"].setValue(printGiftReceipt);
     this.propertyForm.controls["printPendingSettlementReceipt"].setValue(printPendingSettlementReceipt);
     this.propertyForm.controls["groupByTaxName"].setValue(groupByTaxName);
     let displayImageInReceiptHeader = this.PropertyReceiptInfo.configValue.displayImageInReceiptHeader != null ? this.PropertyReceiptInfo.configValue.displayImageInReceiptHeader : this.PropertyReceiptInfo.defaultValue.displayImageInReceiptHeader;
      this.propertyForm.controls["displayImageInReceiptHeader"].setValue(displayImageInReceiptHeader);
      let displayImageInReceiptFooter = this.PropertyReceiptInfo.configValue.displayImageInReceiptFooter != null ? this.PropertyReceiptInfo.configValue.displayImageInReceiptFooter : this.PropertyReceiptInfo.defaultValue.displayImageInReceiptFooter;
      this.propertyForm.controls["displayImageInReceiptFooter"].setValue(displayImageInReceiptFooter);
      let receiptImageFooterNote = this.PropertyReceiptInfo.configValue.receiptImageFooterNote != "" ? this.PropertyReceiptInfo.configValue.receiptImageFooterNote : "";
      let receiptFooterImageReferenceId = this.PropertyReceiptInfo.configValue.footerImageReferenceId;
      let receiptHeaderImageReferenceId = this.PropertyReceiptInfo.configValue.headerImageReferenceId;
      if(displayImageInReceiptFooter== true){
        this.displayImageInReceiptFooter=true;
        this.propertyForm.controls["receiptImageFooterNote"].setValue(receiptImageFooterNote);
        this.mapReceiptImageDataToUI(receiptFooterImageReferenceId,ImgType.receiptFooter)
        this.propertyForm.markAsPristine();
      }
      if(displayImageInReceiptHeader== true){
        this.displayImageInReceiptHeader=true;
        this.mapReceiptImageDataToUI(receiptHeaderImageReferenceId,ImgType.receiptHeader)
        this.propertyForm.markAsPristine();
      }
     if(displayAuthCode == true)
    {
      this.DisplayAuthCode=true;
      this.propertyForm.controls["authcodeName"].setValue(authCode);
      this.propertyForm.controls["displayAuthcode"].setValue(displayAuthCode);
      this.propertyForm.markAsPristine();
    }
    else
    {
      this.propertyForm.controls["displayAuthcode"].setValue(displayAuthCode);
      this.propertyForm.controls["authcodeName"].setValue(authCode);
      this.propertyForm.markAsPristine();
    }
  }
}

  async saveReceiptProperty(data: any) {
    console.log(data);
    sessionStorage.removeItem("propertyReceiptConfiguration");
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
      let propertyReceiptConfig = await this.data.updatePropertyConfig(Propertyreceiptobj);
      propertyReceiptConfig = this.utils.parsePropertyReceiptConfig(propertyReceiptConfig);
      sessionStorage.setItem("propertyReceiptConfiguration",JSON.stringify(propertyReceiptConfig));
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
      this.PropertyReceiptInfo  = this.utils.parsePropertyReceiptConfig(this.PropertyReceiptInfo );
      sessionStorage.setItem("propertyReceiptConfiguration",JSON.stringify( this.PropertyReceiptInfo));
    } 
    let message = this.localization.replacePlaceholders(this.textCaptions.AfterSaveMessage, ['message'], [`the ${this.localization.captions["lbl_property"]}`]);
    this.utils.showAlert(message, AlertType.WellDone);
    this.resetData();
  }

  formConfigValue(data: any): PropertyConfigurationModel {
    const {
      displayAuthcode = false,
      authcodeName,
      displayChangeDue = false,
      receiptFooterNote,
      printGiftReceipt = false,
      printPendingSettlementReceipt,
      headerimagedata,
      footerimagedata,
      headerImageReferenceId = DEFAULT_IMAGE_REFERENCE_ID,
      footerImageReferenceId = DEFAULT_IMAGE_REFERENCE_ID,
      receiptImageFooterNote,
      groupByTaxName
    } = data;
  
    return {
      displayAuthCode: displayAuthcode,
      AuthCodeReceiptName: authcodeName,
      displayChangeDue,
      receiptFooterNote,
      printGiftReceipt,
      printPendingSettlementReceipt,
      displayImageInReceiptHeader: this.displayImageInReceiptHeader || false,
      displayImageInReceiptFooter: this.displayImageInReceiptFooter || false,
      headerimagedata,
      footerimagedata,
      headerImageReferenceId:this.headerImageReferenceId?this.headerImageReferenceId:this.PropertyReceiptInfo.configValue.headerImageReferenceId,
      footerImageReferenceId:this.footerImageReferenceId?this.footerImageReferenceId:this.PropertyReceiptInfo.configValue.footerImageReferenceId,
      receiptImageFooterNote,
      groupByTaxName
    };
  }
  formDefaultValue(data: any)
  {
    let defaultValue : PropertyConfigurationModel = {
      displayAuthCode: false,
      AuthCodeReceiptName: "Auth Code",
      displayChangeDue: false,
      receiptFooterNote: "",
      printGiftReceipt: false,
      printPendingSettlementReceipt: false,
      displayImageInReceiptHeader: false,
      displayImageInReceiptFooter: false,
      headerimagedata: false,
      footerimagedata: false,
      headerImageReferenceId: DEFAULT_IMAGE_REFERENCE_ID, 
      footerImageReferenceId: DEFAULT_IMAGE_REFERENCE_ID,
      receiptImageFooterNote:"",
      groupByTaxName: false
    }
    return defaultValue;
  }

  
  fileSizeExceeded() {
    this._utilities.showAlert(this.textCaptions.ImageSizeExceed, AlertType.Info, ButtonType.Ok);
  }

  async headerImageFileUploaded(data) {
    this.propertyForm.markAsDirty();
    this.propertyForm.markAsTouched();
    this.isImageUpload = true;
    this.propertyForm.controls['headerimagedata'].setValue(true);
    this.base64textString = data['orgImg'];
    this.thumbnailImg = data['tmbImg'];
    this.base64Image = this.base64textString;
    this.thumbnailImg = this.thumbnailImg;
    this.imageRemoved = false;
    this.footerImageReferenceId = this.footerImageReferenceId?this.footerImageReferenceId:this.PropertyReceiptInfo.configValue.footerImageReferenceId;
    this.headerImageReferenceId = await this.savePropertyReceiptImage(data,ImgType.receiptHeader);
  }
  public async savePropertyReceiptImage(data: receiptImageConfiguration, imageType: string): Promise<string> {
   if (this.isImageUpload) {
      let imgRefType: RetailImgRefType;
      
      if (imageType === ImgType.receiptHeader) {
          imgRefType = RetailImgRefType.receiptHeader;
      } else if (imageType === ImgType.receiptFooter) {
          imgRefType = RetailImgRefType.receiptFooter;
      }
      var imgReferenceId = this.imageReferenceId ? this.imageReferenceId : DEFAULT_IMAGE_REFERENCE_ID;
      
      if (imgReferenceId === undefined || imgReferenceId === '' || imgReferenceId === DEFAULT_IMAGE_REFERENCE_ID) {
          const imageGuid = this.utils.generateUUIDUsingMathRandom();
          const imageReferenceIde = await this.saveImageCommon(imgRefType, imageGuid, this.base64Image, this.thumbnailImg);
          data.imageReferenceId = imageReferenceIde;
      } else {
          await this.updateItemImageCommon(imgRefType, imgReferenceId, this.imageId, data.imageReferenceId, this.imageRemoved, this.base64Image, this.thumbnailImg);
          data.imageReferenceId = imgReferenceId;
      }
  } else {
      data.imageReferenceId = this.imageReferenceId ? this.imageReferenceId : DEFAULT_IMAGE_REFERENCE_ID;
  }
  
    return data.imageReferenceId;
  }
  async saveImageCommon(type: RetailImgRefType, referenceId: string, base64textString, thumbnailImg): Promise<string> {
    if (base64textString) {
      const base64result = base64textString.split(',');
      const base64Thumbnail = thumbnailImg.split(',');
      const imageDataObj: Imagedata = {
        referenceId: 0,
        referenceType: type,
        data: base64result[1],
        id: 0,
        thumbnailData: base64Thumbnail[1],
        contentType: base64result[0],
        sequenceNo: 0,
        imageReferenceId: referenceId
      };
      return await this.imgService.saveImage([imageDataObj]);
    }
  }
  async updateItemImageCommon(referenceType: RetailImgRefType, referenceId: string, imageID, imgRefId: string, isImageRemoved, base64textString, thumbnailImg) {
    if (base64textString || isImageRemoved) {
      const base64result = isImageRemoved ? ['', ''] : base64textString.split(',');
      const base64Thumbnail = isImageRemoved ? ['', ''] : thumbnailImg.split(',');
      const imageDataObj: Imagedata = {
        referenceId: 0,
        referenceType: referenceType,
        data: base64result[1],
        id: imageID ? imageID : 0,
        thumbnailData: base64Thumbnail[1],
        contentType: base64result[0],
        sequenceNo: this.sequenceNo,
        imageReferenceId: referenceId
      };
      await this.imgService.updateImage([imageDataObj]);
    }
  }
  async footerImageFileUploaded(data) {
    this.propertyForm.markAsDirty();
    this.propertyForm.markAsTouched();
    this.isImageUpload = true;
    this.propertyForm.controls['footerimagedata'].setValue(true);
    this.base64textString = data['orgImg'];
    this.thumbnailImg = data['tmbImg'];
    this.base64Image = this.base64textString;
    this.thumbnailImg = this.thumbnailImg;
    this.imageRemoved = false;
    this.headerImageReferenceId = this.headerImageReferenceId?this.headerImageReferenceId:this.PropertyReceiptInfo.configValue.headerImageReferenceId;
    this.footerImageReferenceId = await this.savePropertyReceiptImage(data,ImgType.receiptFooter);
  }
  async mapReceiptImageDataToUI(imageReferenceId: string, imageType?: ImgType) {
    if (!imageReferenceId || imageReferenceId === DEFAULT_IMAGE_REFERENCE_ID) {
        return;
    }

    const imageData = await this.getImageForHeaderFooterRefIds(imageReferenceId, true);
    const image = imageData?.[0];
    if (!image?.thumbnailData) {
        return;
    }
    if (imageType === ImgType.receiptFooter) {
        this.footerUrl = `${image.contentType ?? ''},${image.thumbnailData ?? ''}`;
    } else if (imageType === ImgType.receiptHeader) {
        this.headerUrl = `${image.contentType ?? ''},${image.thumbnailData ?? ''}`;
    }
}
  
async getImageForHeaderFooterRefIds(imgRefId: string, isthumbnailonly: boolean): Promise<Imagedata> {
  return await this.imgService.GetImagesByReferenceId(imgRefId, isthumbnailonly);

}
headerImageFileDeleted() {
  this.propertyForm.markAsDirty();
  this.propertyForm.markAsTouched();
  this.isSaveDisabled = false;
  this.headerImageReferenceId = DEFAULT_IMAGE_REFERENCE_ID;
}
footerImageFileDeleted() {
  this.propertyForm.markAsDirty();
  this.propertyForm.markAsTouched();
  this.isSaveDisabled = false; 
  this.footerImageReferenceId = DEFAULT_IMAGE_REFERENCE_ID;
}
}
