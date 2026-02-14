import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { Outlet, ReceiptModel, PropertyReceiptModel, ImgType, receiptImageConfiguration, RetailImgRefType, TaxGroupingOption } from '../../../retail/retail.modals';
import { ReceiptConfigurationDataService } from './receipt-configuration-data';
import { RetailOutletsDataService } from '../../../retail/retail-code-setup/retail-outlets/retail-outlets-data.service';
import { RetailBreakPoint, ButtonType } from 'src/app/common/shared/shared/globalsContant';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { AgToggleConfig, DropdownOptions } from 'src/app/common/Models/ag-models';
import { AlertType, Imagedata } from 'src/app/shared/shared-models';
import { ImageDataService } from 'src/app/shared/data-services/Image/image.data.services';
import { DEFAULT_IMAGE_REFERENCE_ID } from 'src/app/app-constants';
import { RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailDataAwaiters } from 'src/app/retail/shared/events/awaiters/retail.data.awaiters';

@Component({
  standalone: false,
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
  allowReceiptCopiesInputs : AgToggleConfig;
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
  ReplaceMemberNumberWithARToggleInputs: AgToggleConfig;
  taxGroupingOptions: any[];
  CombineAllTaxesToggleInputs: AgToggleConfig;
  CombineAllRevenueToPropertyToggleInputs: AgToggleConfig;
  CombineAllTaxesAndRevenueToPropertyToggleInputs: AgToggleConfig;
  showRollUpToOneToggles: boolean = false;
  // Track toggle states for conditional text boxes
  showCombineAllTaxesTextBox: boolean = false;
  showCombineAllRevenueToPropertyTextBox: boolean = false;
  showCombineAllTaxesAndRevenueToPropertyTextBox: boolean = false;
  defaultTax: string = 'Tax';
  enableSerialInvoiceRange: boolean = false;
  defaultMinNoOfDigits: number = 1;
  defaultReceiptNumber: number = 0;
  minDigitsErrMsg: string;
  fromToRangeErrMsg: string;
  outletId:number;

  constructor(private Form: UntypedFormBuilder,
    private breakPoint: BreakPointAccess,
    public localization: RetailStandaloneLocalization,
    private data: ReceiptConfigurationDataService,
    private outletData: RetailOutletsDataService, private utils: RetailUtilities, private imgService: ImageDataService,
    public PropertyInfo: RetailPropertyInformation, public retailLocalization: RetailLocalization) {
      
    this.enableSerialInvoiceRange = this.retailLocalization.IsLocationInPhilippines();
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
      itemDescriptionHeader: [''],
      printReceipt: this.Form.array([this.addPrintDetails()])
    });
    this.propertyForm = this.Form.group({
      printGiftReceipt:[''],
      displayAuthcode: [''],
      authcodeName: [''],
      displayChangeDue: [''],
      receiptFooterNote: [''],
      printPendingSettlementReceipt: [''],
      allowReceiptCopies:[''],
      displayImageInReceiptHeader: [false],
      displayImageInReceiptFooter: [false],
      headerimagedata: false,
      footerimagedata: false,
      headerImageReferenceId: DEFAULT_IMAGE_REFERENCE_ID,
      footerImageReferenceId:DEFAULT_IMAGE_REFERENCE_ID,
      propertyImageAlign: '0',
      receiptImageFooterNote: [''],
      groupByTaxName:[false],
      replaceMemberNumberWithAR:[false],
      taxGroupingOption: [TaxGroupingOption.ShowIndividually],
      combineAllTaxes: [false],
      combineAllRevenueToProperty: [false],
      combineAllTaxesAndRevenueToProperty: [false],
      // Tax name text boxes
      combineAllTaxesName: [this.defaultTax, Validators.required],
      combineAllRevenueToPropertyName: [this.defaultTax, Validators.required],
      combineAllTaxesAndRevenueToPropertyName: [this.defaultTax, Validators.required],
      fromReceiptNumber: [this.defaultReceiptNumber, this.enableSerialInvoiceRange ? [Validators.required, this.numberMinLengthValidator(this.defaultMinNoOfDigits)] : []],
      toReceiptNumber: [this.defaultReceiptNumber, this.enableSerialInvoiceRange ? [Validators.required, this.numberMinLengthValidator(this.defaultMinNoOfDigits)] : []]
    }, { validators: this.enableSerialInvoiceRange ? this.fromToRangeValidator() : null });
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
    this.allowReceiptCopiesInputs = {
      group: this.propertyForm,
      formControlName: 'allowReceiptCopies',
      automationId:"'Tog_ReceiptConfiguration_allowReceiptCopies'"
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
    this.ReplaceMemberNumberWithARToggleInputs = {
      group: this.propertyForm,
      formControlName: 'replaceMemberNumberWithAR',
      automationId:'Tog_ReceiptConfiguration_replaceMemberNumberWithAR'
    }
    this.CombineAllTaxesToggleInputs = {
      group: this.propertyForm,
      formControlName: 'combineAllTaxes',
      automationId:'Tog_ReceiptConfiguration_combineAllTaxes',
    }
    this.CombineAllRevenueToPropertyToggleInputs = {
      group: this.propertyForm,
      formControlName: 'combineAllRevenueToProperty',
      automationId:'Tog_ReceiptConfiguration_combineAllRevenueToProperty',
    }
    this.CombineAllTaxesAndRevenueToPropertyToggleInputs = {
      group: this.propertyForm,
      formControlName: 'combineAllTaxesAndRevenueToProperty',
      automationId:'Tog_ReceiptConfiguration_combineAllTaxesAndRevenueToProperty'
    }

    this.taxGroupingOptions = [
      { id: TaxGroupingOption.ShowIndividually, value: this.textCaptions.ShowIndividually },
      { id: TaxGroupingOption.SumByTaxName, value: this.textCaptions.SumByTaxName },
      { id: TaxGroupingOption.SumWithParent, value: this.textCaptions.SumWithParent },
      { id: TaxGroupingOption.RollUpToOne, value: this.textCaptions.RollUpToOne }

    ]
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
      { id: 10, Name: this.textCaptions.GroupedItem, controlName: 'groupedItem', enableToggle: true }
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
      this.FormGrp.controls['itemDescriptionHeader'].disable();
      this.printInfo.map(x => x.enableToggle = false);
    }
    this.isSaveDisabled = true;
    this.getPropertyReceiptConfig();

    // Initialize Roll Up to One toggles visibility
    this.showRollUpToOneToggles = this.propertyForm.get('taxGroupingOption')?.value === TaxGroupingOption.RollUpToOne;
    this.propertyForm.valueChanges.subscribe(() => this.validateRollUpToOneToggles());

    this.minDigitsErrMsg = this.textCaptions.errMinDigitsNeeded.replace('{minDigits}', '6');
    this.fromToRangeErrMsg = this.textCaptions.errFromGreaterThanTo;
    const DefaultOutletId = RetailDataAwaiters.GetDefaultOutlet()?.id;
    if(DefaultOutletId) { 
      this.outletId = DefaultOutletId;
      this.changeSelection({value: this.outletId});
    }
  }

  private getPrintInfoById(id: number) {
    return this.printInfo.find(item => item.id === id);
  }

  private setPrintInfoEnabledById(id: number, enabled: boolean) {
    const item = this.getPrintInfoById(id);
    if (item) {
      item.enableToggle = enabled;
    }
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
      groupedItem: selectedValues[0].displayGroupedItem,
      surplusPrintedByOnReceipt:  selectedValues[0].suppressPrintedBy,
      clerkIdPrintValue:  selectedValues[0].clerkIdPrintValue,
      printedByPrintValue:  selectedValues[0].printedByPrintValue      
    };

    this.FormGrp.get('outlet').setValue(selectedValues[0].outletId);
    this.FormGrp.get('noOfReceipts').setValue(selectedValues[0].numberOfReceipts);
    this.FormGrp.get('displayServiceCharge').setValue(selectedValues[0].serviceChargeGratuityDisplay);
    this.FormGrp.get('gratuityLine').setValue(selectedValues[0].gratuityLine);
    this.FormGrp.get('receiptNote').setValue(selectedValues[0].receiptNote);
    this.FormGrp.get('itemDescriptionHeader').setValue(selectedValues[0].itemDescriptionHeader);
    this.printReceiptArray = this.FormGrp.get('printReceipt') as UntypedFormArray;
    this.printReceiptArray.removeAt(0);
    const x = this.savePrintDetails(printReceiptCustom);
    this.printReceiptArray.push(x);
    if (selectedValues[0].displayPackageDescription && !this.IsViewOnly) {
      this.setPrintInfoEnabledById(4, true);  // PackItemPrice
      this.setPrintInfoEnabledById(5, true);  // PackItemOnReceipt  
      this.setPrintInfoEnabledById(8, true);  // PackItemStaffCode
    }
    if (selectedValues[0].displayOnlyPackageItem) {
      this.setPrintInfoEnabledById(2, false); // DisplayPackageItemDesc
      this.setPrintInfoEnabledById(4, false); // PackItemPrice
      this.setPrintInfoEnabledById(5, false); // PackItemOnReceipt
      this.setPrintInfoEnabledById(8, false); // PackItemStaffCode
    }
    if (selectedValues[0].suppressClerkId == false || selectedValues[0].suppressPrintedBy == false) {
      this.isSuppressClerk = true;
      this.isSuppressPrint = true;
    }
    if (selectedValues[0].displayOnlyPackageItem == false) {
      if (selectedValues[0].displayPackageDescription) {
        this.setPrintInfoEnabledById(4, true);  // PackItemPrice
        this.setPrintInfoEnabledById(5, true);  // PackItemOnReceipt
        this.setPrintInfoEnabledById(8, true);  // PackItemStaffCode
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
      groupedItem: '',
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
      groupedItem: data.groupedItem,
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
      this.setPrintInfoEnabledById(4, true);  // PackItemPrice
      this.setPrintInfoEnabledById(5, true);  // PackItemOnReceipt
      this.setPrintInfoEnabledById(8, true);  // PackItemStaffCode
    } else if (controlName == 'packItemDesc' && !event[0]) {
      this.setPrintInfoEnabledById(4, false); // PackItemPrice
      this.setPrintInfoEnabledById(5, false); // PackItemOnReceipt
      this.setPrintInfoEnabledById(8, false); // PackItemStaffCode
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
      this.setPrintInfoEnabledById(2, false); // DisplayPackageItemDesc
      // this.FormGrp.controls[0].value.packItemDesc = false;
      // this.FormGrp.controls.printReceipt.value[0].packItemDesc = false;
      this.setPrintInfoEnabledById(4, false); // PackItemPrice
      this.setPrintInfoEnabledById(5, false); // PackItemOnReceipt
      this.setPrintInfoEnabledById(8, false); // PackItemStaffCode
    } else if (controlName == 'packageItemOnReceipt' && !event[0] && !this.IsViewOnly) {
      if (this.FormGrp.controls.printReceipt.value[0].packItemDesc) {
        this.setPrintInfoEnabledById(4, true);  // PackItemPrice
        this.setPrintInfoEnabledById(5, true);  // PackItemOnReceipt
        this.setPrintInfoEnabledById(8, true);  // PackItemStaffCode
      }
      this.setPrintInfoEnabledById(2, true);  // DisplayPackageItemDesc
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
      displayGroupedItem: data.printReceipt[0].groupedItem ? true : false,
      displayPackageStaffCode: data.printReceipt[0].packStaffCode ? true : false,
      serviceChargeGratuityDisplay: data.displayServiceCharge,
      gratuityLine: data.gratuityLine,
      receiptNote: data.receiptNote,
      itemDescriptionHeader: data.itemDescriptionHeader,
      suppressPrintedBy: data.printReceipt[0]. surplusPrintedByOnReceipt ? true : false,
      clerkIdPrintValue: data.printReceipt[0].surplusClientIdOnReceiptbyName ? data.printReceipt[0].surplusClientIdOnReceiptbyName : 0,
      printedByPrintValue: data.printReceipt[0].surplusPrintedByOnReceiptbyName ? data.printReceipt[0].surplusPrintedByOnReceiptbyName :0,
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

  validateRollUpToOneToggles() {
    const form = this.propertyForm;
    const dirty = form.dirty;

  const combineTaxes    = form.get('combineAllTaxes')?.value;
  const combineRevenue  = form.get('combineAllRevenueToProperty')?.value;
  const combineBoth     = form.get('combineAllTaxesAndRevenueToProperty')?.value;

    const atLeastOne = combineTaxes || combineRevenue || combineBoth;

    let disableSave = this.showRollUpToOneToggles
      ? (!dirty || !atLeastOne)
      : (!dirty);

    const taxFields =
    (combineTaxes   && !form.get('combineAllTaxesName')?.value?.trim())   ||
      (combineRevenue && !form.get('combineAllRevenueToPropertyName')?.value?.trim()) ||
    (combineBoth    && !form.get('combineAllTaxesAndRevenueToPropertyName')?.value?.trim());

    this.isSaveDisabled = disableSave || !!taxFields;
  }

  onTaxGroupingOptionChange(value: TaxGroupingOption) {
    this.showRollUpToOneToggles = value === TaxGroupingOption.RollUpToOne;
    if (this.showRollUpToOneToggles) {
      this.propertyForm.patchValue({
        combineAllTaxes: this.showCombineAllTaxesTextBox,
        combineAllRevenueToProperty: this.showCombineAllRevenueToPropertyTextBox,
        combineAllTaxesAndRevenueToProperty: this.showCombineAllTaxesAndRevenueToPropertyTextBox
      });
      if (this.showCombineAllTaxesTextBox) {
        if (this.showCombineAllRevenueToPropertyTextBox) {
          this.propertyForm.get('combineAllRevenueToPropertyName')?.enable({ emitEvent: false });
          this.propertyForm.get('combineAllRevenueToPropertyName')?.setValidators([Validators.required]);
          this.propertyForm.get('combineAllRevenueToPropertyName')?.updateValueAndValidity();
        }
        this.onCombineAllTaxesToggle(this.showCombineAllTaxesTextBox);
      } else if (this.showCombineAllRevenueToPropertyTextBox) {
        this.onCombineAllRevenueToPropertyToggle(this.showCombineAllRevenueToPropertyTextBox);
      } else {
        this.CombineAllTaxesAndRevenueToPropertyToggleInputs.disabled = false;
        this.onCombineAllTaxesAndRevenueToPropertyToggle(true);
      }
    } else {
      // Reset toggle values when not "Roll Up to One"
      this.propertyForm.patchValue({
        combineAllTaxes: false,
        combineAllRevenueToProperty: false,
        combineAllTaxesAndRevenueToProperty: false,
        combineAllTaxesName: this.propertyForm.get('combineAllTaxesName')?.value ? this.propertyForm.get('combineAllTaxesName')?.value : this.defaultTax,
        combineAllRevenueToPropertyName: this.propertyForm.get('combineAllRevenueToPropertyName')?.value ? this.propertyForm.get('combineAllRevenueToPropertyName')?.value : this.defaultTax,
        combineAllTaxesAndRevenueToPropertyName: this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.value ? this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.value : this.defaultTax
      }, { emitEvent: false });
      this.propertyForm.get('combineAllTaxes')!
        .enable({ emitEvent: false });
      this.propertyForm.get('combineAllRevenueToProperty')!
        .enable({ emitEvent: false });
      this.propertyForm.get('combineAllTaxesAndRevenueToProperty')!
        .enable({ emitEvent: false });
    }
    this.CombineAllTaxesToggleInputs = { ...this.CombineAllTaxesToggleInputs };
    this.CombineAllRevenueToPropertyToggleInputs = { ...this.CombineAllRevenueToPropertyToggleInputs };
    this.CombineAllTaxesAndRevenueToPropertyToggleInputs = { ...this.CombineAllTaxesAndRevenueToPropertyToggleInputs };
    this.propertyForm.updateValueAndValidity();
    this.propertyForm.markAsDirty();
    this.validateRollUpToOneToggles();
  }

  // Toggle change handlers for showing/hiding text boxes
  onCombineAllTaxesToggle(checked: boolean) {
    this.propertyForm.markAsDirty();
    this.showCombineAllTaxesTextBox = checked;
    const control = this.propertyForm.get('combineAllTaxesName');
    if (checked) {
      control?.enable({ emitEvent: false });
      control?.setValidators([Validators.required]);
      control?.updateValueAndValidity();
      // If Combine All Taxes is turned ON, turn OFF Combine All Taxes and Revenue to Property
      this.propertyForm.patchValue({
        combineAllTaxesAndRevenueToProperty: false,
      });
      this.propertyForm.updateValueAndValidity();
      // Update visibility state
      this.showCombineAllTaxesAndRevenueToPropertyTextBox = false;
      this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.clearValidators();
      this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.disable({ emitEvent: false });
      this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.updateValueAndValidity();
      this.propertyForm.get('combineAllTaxes')?.enable();
      this.propertyForm.get('combineAllTaxes')?.updateValueAndValidity({ emitEvent: false });
    } else {
      control?.clearValidators();
      control?.disable({ emitEvent: false });
      control?.updateValueAndValidity();
    }
    this.validateRollUpToOneToggles();
  }

  onCombineAllRevenueToPropertyToggle(checked: boolean) {
    this.propertyForm.markAsDirty();
    this.showCombineAllRevenueToPropertyTextBox = checked;
    const control = this.propertyForm.get('combineAllRevenueToPropertyName');
    if (checked) {
      control?.enable({ emitEvent: false });
      control?.setValidators([Validators.required]);
      control?.updateValueAndValidity();
      // If Combine All Revenue to Property is turned ON, turn OFF Combine All Taxes and Revenue to Property
      this.propertyForm.patchValue({
        combineAllTaxesAndRevenueToProperty: false,
      });
      this.propertyForm?.updateValueAndValidity();
      // Update visibility state
      this.showCombineAllTaxesAndRevenueToPropertyTextBox = false;
      this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.clearValidators();
      this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.disable({ emitEvent: false });
      this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.updateValueAndValidity();
      this.propertyForm.get('combineAllRevenueToProperty')?.enable();
      this.propertyForm.get('combineAllRevenueToProperty')?.updateValueAndValidity({ emitEvent: false });
    } else {
      control?.disable({ emitEvent: false });
      control?.clearValidators();
      control?.updateValueAndValidity();
    }
    this.validateRollUpToOneToggles();
  }

  onCombineAllTaxesAndRevenueToPropertyToggle(checked: boolean) {
    this.propertyForm.markAsDirty();
    this.showCombineAllTaxesAndRevenueToPropertyTextBox = checked;
    const control = this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName');
    if (checked) {
      control?.enable({ emitEvent: false });
      control?.setValidators([Validators.required]);
      control?.updateValueAndValidity();
      // If Combine All Taxes and Revenue to Property is turned ON, turn OFF the other two toggles
      this.propertyForm.patchValue({
        combineAllTaxes: false,
        combineAllRevenueToProperty: false,
        combineAllTaxesAndRevenueToProperty: true
      });
      this.propertyForm.updateValueAndValidity({ emitEvent: false });
      // Update visibility states
      this.showCombineAllTaxesTextBox = false;
      this.showCombineAllRevenueToPropertyTextBox = false;
      this.propertyForm.get('combineAllTaxesName')?.clearValidators();
      this.propertyForm.get('combineAllTaxesName')?.disable({ emitEvent: false });
      this.propertyForm.get('combineAllTaxesName')?.updateValueAndValidity();
      this.propertyForm.get('combineAllRevenueToPropertyName')?.clearValidators();
      this.propertyForm.get('combineAllRevenueToPropertyName')?.disable({ emitEvent: false });
      this.propertyForm.get('combineAllRevenueToPropertyName')?.updateValueAndValidity();
      this.propertyForm.get('combineAllTaxes')?.disable();
      this.propertyForm.get('combineAllTaxes')?.updateValueAndValidity({ emitEvent: false });
      this.propertyForm.get('combineAllRevenueToProperty')?.disable();
      this.propertyForm.get('combineAllRevenueToProperty')?.updateValueAndValidity({ emitEvent: false });
      this.propertyForm.get('combineAllTaxesAndRevenueToProperty')?.enable({ emitEvent: false });
      this.propertyForm.get('combineAllTaxesAndRevenueToProperty')?.updateValueAndValidity();
    } else {
      control?.clearValidators();
      control?.disable({ emitEvent: false });
      control?.updateValueAndValidity();
    }
    this.CombineAllTaxesToggleInputs.disabled = this.propertyForm.get('combineAllTaxesAndRevenueToProperty').value;
    this.CombineAllRevenueToPropertyToggleInputs.disabled = this.propertyForm.get('combineAllTaxesAndRevenueToProperty').value;
    this.CombineAllTaxesToggleInputs = { ...this.CombineAllTaxesToggleInputs };
    this.CombineAllRevenueToPropertyToggleInputs = { ...this.CombineAllRevenueToPropertyToggleInputs };
    this.CombineAllTaxesAndRevenueToPropertyToggleInputs = { ...this.CombineAllTaxesAndRevenueToPropertyToggleInputs }
    this.validateRollUpToOneToggles();
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
  async getPropertyReceiptConfig() {
    this.PropertyReceiptInfo = await this.data.getPropertyReceiptConfig();
    if (this.PropertyReceiptInfo && this.PropertyReceiptInfo.id) {
      let authCode = this.PropertyReceiptInfo.configValue.authCodeReceiptName != "" ?
        this.PropertyReceiptInfo.configValue.authCodeReceiptName : this.PropertyReceiptInfo.defaultValue.authCodeReceiptName;
      let receiptFooterNote = this.PropertyReceiptInfo.configValue.receiptFooterNote != "" ?
        this.PropertyReceiptInfo.configValue.receiptFooterNote : "";
      let displayAuthCode = this.PropertyReceiptInfo.configValue.displayAuthCode != false ?
        this.PropertyReceiptInfo.configValue.displayAuthCode : this.PropertyReceiptInfo.defaultValue.displayAuthCode;
      let displayChangeDue = this.PropertyReceiptInfo.configValue.displayChangeDue != false ?
        this.PropertyReceiptInfo.configValue.displayChangeDue : this.PropertyReceiptInfo.defaultValue.displayChangeDue;
      let printGiftReceipt = this.PropertyReceiptInfo.configValue.printGiftReceipt != null ? this.PropertyReceiptInfo.configValue.printGiftReceipt : false;
      let printPendingSettlementReceipt = this.PropertyReceiptInfo.configValue.printPendingSettlementReceipt != null ? this.PropertyReceiptInfo.configValue.printPendingSettlementReceipt : false;
      let allowReceiptCopies = this.PropertyReceiptInfo.configValue.allowReceiptCopies != null ? this.PropertyReceiptInfo.configValue.allowReceiptCopies : false;
      let groupByTaxName = this.PropertyReceiptInfo.configValue.groupByTaxName != null ? this.PropertyReceiptInfo.configValue.groupByTaxName : false;
      let replaceMemberNumberWithAR = this.PropertyReceiptInfo.configValue.replaceMemberNumberWithAR != null ? this.PropertyReceiptInfo.configValue.replaceMemberNumberWithAR : false;
      let taxGroupingOption = (this.PropertyReceiptInfo.configValue.taxGroupingOption != null && this.PropertyReceiptInfo.configValue.taxGroupingOption != 0) ? this.PropertyReceiptInfo.configValue.taxGroupingOption : TaxGroupingOption.ShowIndividually;
      let combineAllTaxes = this.PropertyReceiptInfo.configValue.combineAllTaxes != null ? this.PropertyReceiptInfo.configValue.combineAllTaxes : false;
      let combineAllRevenueToProperty = this.PropertyReceiptInfo.configValue.combineAllRevenueToProperty != null ? this.PropertyReceiptInfo.configValue.combineAllRevenueToProperty : false;
      let combineAllTaxesAndRevenueToProperty = this.PropertyReceiptInfo.configValue.combineAllTaxesAndRevenueToProperty != null ? this.PropertyReceiptInfo.configValue.combineAllTaxesAndRevenueToProperty : false;
      let fromReceiptNumber = this.PropertyReceiptInfo.configValue.fromReceiptNumber ? this.PropertyReceiptInfo.configValue.fromReceiptNumber : this.defaultReceiptNumber;
      let toReceiptNumber = this.PropertyReceiptInfo.configValue.toReceiptNumber ? this.PropertyReceiptInfo.configValue.toReceiptNumber : this.defaultReceiptNumber;
      this.propertyForm.controls["displayChangeDue"].setValue(displayChangeDue);
      this.propertyForm.controls["receiptFooterNote"].setValue(receiptFooterNote);
      this.propertyForm.controls["printGiftReceipt"].setValue(printGiftReceipt);
      this.propertyForm.controls["printPendingSettlementReceipt"].setValue(printPendingSettlementReceipt);
      this.propertyForm.controls["allowReceiptCopies"].setValue(allowReceiptCopies);
      this.propertyForm.controls["groupByTaxName"].setValue(groupByTaxName);
      this.propertyForm.controls["replaceMemberNumberWithAR"].setValue(replaceMemberNumberWithAR);
      this.propertyForm.controls["taxGroupingOption"].setValue(taxGroupingOption);
      this.propertyForm.controls["combineAllTaxes"].setValue(combineAllTaxes);
      this.propertyForm.controls["combineAllRevenueToProperty"].setValue(combineAllRevenueToProperty);
      this.propertyForm.controls["combineAllTaxesAndRevenueToProperty"].setValue(combineAllTaxesAndRevenueToProperty);
      this.propertyForm.controls["fromReceiptNumber"].setValue(fromReceiptNumber);
      this.propertyForm.controls["toReceiptNumber"].setValue(toReceiptNumber);
      // Load tax name text boxes
      let combineAllTaxesName = this.defaultTax;
      let combineAllRevenueToPropertyName = this.defaultTax;
      let combineAllTaxesAndRevenueToPropertyName = this.defaultTax;
      if (combineAllTaxes) {
        combineAllTaxesName = this.PropertyReceiptInfo.configValue.combineAllTaxesName || this.defaultTax;
        this.onCombineAllTaxesToggle(true);
        this.propertyForm.get('combineAllRevenueToProperty')!.enable({ emitEvent: false });
      }else{
        this.propertyForm.get('combineAllTaxesName')?.disable({ emitEvent: false });
      }
      if (combineAllRevenueToProperty) {
        combineAllRevenueToPropertyName = this.PropertyReceiptInfo.configValue.combineAllRevenueToPropertyName || this.defaultTax;
        this.onCombineAllRevenueToPropertyToggle(true);
        this.propertyForm.get('combineAllTaxes')!.enable({ emitEvent: false });
      }else{
        this.propertyForm.get('combineAllRevenueToPropertyName')?.disable({ emitEvent: false });
      }
      if (combineAllTaxesAndRevenueToProperty) {
        combineAllTaxesAndRevenueToPropertyName = this.PropertyReceiptInfo.configValue.combineAllTaxesAndRevenueToPropertyName || this.defaultTax;
        this.onCombineAllTaxesAndRevenueToPropertyToggle(true);
      }else{
        this.propertyForm.get('combineAllTaxesAndRevenueToPropertyName')?.disable({ emitEvent: false });
      }
      this.propertyForm.controls["combineAllTaxesName"].setValue(combineAllTaxesName);
      this.propertyForm.controls["combineAllRevenueToPropertyName"].setValue(combineAllRevenueToPropertyName);
      this.propertyForm.controls["combineAllTaxesAndRevenueToPropertyName"].setValue(combineAllTaxesAndRevenueToPropertyName);

      // Update text box visibility based on loaded toggle values
      this.showCombineAllTaxesTextBox = combineAllTaxes;
      this.showCombineAllRevenueToPropertyTextBox = combineAllRevenueToProperty;
      this.showCombineAllTaxesAndRevenueToPropertyTextBox = combineAllTaxesAndRevenueToProperty;

      // Update toggle visibility based on loaded value
      this.showRollUpToOneToggles = taxGroupingOption === TaxGroupingOption.RollUpToOne;
      let displayImageInReceiptHeader = this.PropertyReceiptInfo.configValue.displayImageInReceiptHeader != null ? this.PropertyReceiptInfo.configValue.displayImageInReceiptHeader : this.PropertyReceiptInfo.defaultValue.displayImageInReceiptHeader;
      this.propertyForm.controls["displayImageInReceiptHeader"].setValue(displayImageInReceiptHeader);
      let displayImageInReceiptFooter = this.PropertyReceiptInfo.configValue.displayImageInReceiptFooter != null ? this.PropertyReceiptInfo.configValue.displayImageInReceiptFooter : this.PropertyReceiptInfo.defaultValue.displayImageInReceiptFooter;
      this.propertyForm.controls["displayImageInReceiptFooter"].setValue(displayImageInReceiptFooter);
      let receiptImageFooterNote = this.PropertyReceiptInfo.configValue.receiptImageFooterNote != "" ? this.PropertyReceiptInfo.configValue.receiptImageFooterNote : "";
      let receiptFooterImageReferenceId = this.PropertyReceiptInfo.configValue.footerImageReferenceId;
      let receiptHeaderImageReferenceId = this.PropertyReceiptInfo.configValue.headerImageReferenceId;
      if (displayImageInReceiptFooter == true) {
        this.displayImageInReceiptFooter = true;
        this.propertyForm.controls["receiptImageFooterNote"].setValue(receiptImageFooterNote);
        this.mapReceiptImageDataToUI(receiptFooterImageReferenceId, ImgType.receiptFooter)
        this.propertyForm.markAsPristine();
      }
      if (displayImageInReceiptHeader == true) {
        this.displayImageInReceiptHeader = true;
        this.mapReceiptImageDataToUI(receiptHeaderImageReferenceId, ImgType.receiptHeader)
        this.propertyForm.markAsPristine();
      }
      if (displayAuthCode == true) {
        this.DisplayAuthCode = true;
        this.propertyForm.controls["authcodeName"].setValue(authCode);
        this.propertyForm.controls["displayAuthcode"].setValue(displayAuthCode);
        this.propertyForm.markAsPristine();
      } else {
        this.propertyForm.controls["displayAuthcode"].setValue(displayAuthCode);
        this.propertyForm.controls["authcodeName"].setValue(authCode);
        this.propertyForm.markAsPristine();
      }
      this.propertyForm.markAsPristine();
      this.propertyForm.updateValueAndValidity({ emitEvent: false });
      this.validateRollUpToOneToggles();
    }
  }

  async saveReceiptProperty(data: any) {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }
    if (data?.fromReceiptNumber) {
      data.fromReceiptNumber = Number(data.fromReceiptNumber)
      data.toReceiptNumber = Number(data.toReceiptNumber)
      this.propertyForm.controls["fromReceiptNumber"].setValue(data.fromReceiptNumber);
      this.propertyForm.controls["toReceiptNumber"].setValue(data.toReceiptNumber);
      this.propertyForm.updateValueAndValidity({ emitEvent: false });
    }
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

  formConfigValue(data: any): any {
    const {
      displayAuthcode = false,
      authcodeName,
      displayChangeDue = false,
      receiptFooterNote,
      printGiftReceipt = false,
      printPendingSettlementReceipt,
      allowReceiptCopies,
      headerimagedata,
      footerimagedata,
      headerImageReferenceId = DEFAULT_IMAGE_REFERENCE_ID,
      footerImageReferenceId = DEFAULT_IMAGE_REFERENCE_ID,
      receiptImageFooterNote,
      groupByTaxName,
      replaceMemberNumberWithAR,
      taxGroupingOption,
      combineAllTaxes,
      combineAllRevenueToProperty,
      combineAllTaxesAndRevenueToProperty,
      combineAllTaxesName,
      combineAllRevenueToPropertyName,
      combineAllTaxesAndRevenueToPropertyName,
      fromReceiptNumber,
      toReceiptNumber
    } = data;

    return {
      displayAuthCode: displayAuthcode,
      AuthCodeReceiptName: authcodeName,
      displayChangeDue,
      receiptFooterNote,
      printGiftReceipt,
      printPendingSettlementReceipt,
      allowReceiptCopies,
      displayImageInReceiptHeader: this.displayImageInReceiptHeader || false,
      displayImageInReceiptFooter: this.displayImageInReceiptFooter || false,
      headerimagedata,
      footerimagedata,
      headerImageReferenceId:this.headerImageReferenceId?this.headerImageReferenceId:this.PropertyReceiptInfo.configValue.headerImageReferenceId,
      footerImageReferenceId:this.footerImageReferenceId?this.footerImageReferenceId:this.PropertyReceiptInfo.configValue.footerImageReferenceId,
      receiptImageFooterNote,
      groupByTaxName,
      replaceMemberNumberWithAR,
      taxGroupingOption,
      combineAllTaxes,
      combineAllRevenueToProperty,
      combineAllTaxesAndRevenueToProperty,
      combineAllTaxesName,
      combineAllRevenueToPropertyName,
      combineAllTaxesAndRevenueToPropertyName,
      fromReceiptNumber,
      toReceiptNumber
    };
  }
  formDefaultValue(data: any):any
  {
    let defaultValue : any = {
      displayAuthCode: false,
      AuthCodeReceiptName: "Auth Code",
      displayChangeDue: false,
      receiptFooterNote: "",
      printGiftReceipt: false,
      printPendingSettlementReceipt: false,
      allowReceiptCopies : false,
      displayImageInReceiptHeader: false,
      displayImageInReceiptFooter: false,
      headerimagedata: false,
      footerimagedata: false,
      headerImageReferenceId: DEFAULT_IMAGE_REFERENCE_ID,
      footerImageReferenceId: DEFAULT_IMAGE_REFERENCE_ID,
      receiptImageFooterNote:"",
      groupByTaxName: false,
      replaceMemberNumberWithAR:false,
      taxGroupingOption: TaxGroupingOption.ShowIndividually,
      combineAllTaxes: false,
      combineAllRevenueToProperty: false,
      combineAllTaxesAndRevenueToProperty: false,
      combineAllTaxesName: this.defaultTax,
      combineAllRevenueToPropertyName: this.defaultTax,
      combineAllTaxesAndRevenueToPropertyName: this.defaultTax,
      fromReceiptNumber: this.defaultReceiptNumber,
      toReceiptNumber: this.defaultReceiptNumber
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

  /**
   * Cross-field validator to check fromReceiptNumber <= toReceiptNumber
   * @return Validator function for FormGroup
   */
  private fromToRangeValidator() {
    return (formGroup: UntypedFormGroup): ValidationErrors | null => {
      const fromControl = formGroup.get('fromReceiptNumber');
      const toControl = formGroup.get('toReceiptNumber');
      
      if (!fromControl || !toControl) {
        return null;
      }
      
      const fromValue = Number(fromControl.value);
      const toValue = Number(toControl.value);
      
      // Only validate if both values are valid numbers and greater than 0
      if (fromValue > 0 && toValue > 0 && fromValue > toValue) {
        return { 'fromGreaterThanTo': true };
      } else {
        // Clear fromGreaterThanTo error if it exists
        if (fromControl.errors?.['fromGreaterThanTo']) {
          const { fromGreaterThanTo, ...otherErrors } = fromControl.errors;
          fromControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }
      
      return null;
    };
  }

  /**
   * Custom validator to check minimum length for number inputs
   * @param minLength Minimum length required
   * @return Validator function
   */
  private numberMinLengthValidator(minLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null; // Don't validate empty values, let required validator handle it
      }
      const valueStr = control.value.toString();
      if (valueStr.length < minLength) {
        return {
          'minlength': {
            requiredLength: minLength,
            actualLength: valueStr.length,
            value: control.value
          }
        };
      } else if (Number(control.value) == 0) {
        return { 'allZeros': true };
      }
      return null;
    };
  }

}