import { ReportGroup, ReportCode, ReportBreakPoint, TransLogType, CustomTemplate } from './common/report.constants';


export interface Validator {
  name: string;
  validator: any;
  message: string;
}
export interface FieldConfig {
  label?: string;
  name?: string;
  inputType?: string;
  options?: any;
  collections?: any;
  type: string;
  value?: any;
  validations?: Validator[];
  maxDate?: Date;
  minDate?: Date;
  // Required field in case of multiselect drop down
  // Text will be displayed in place of all option
  allDisplayText?: string;
  // Required field in case of multiselect drop down
  // text to be suffixed in case of multiple options selected in drop down
  moreDisplayText?: string;
  maxlength?: number;
}

export interface Option {
  id: number;
  code?: string;
  description: string;
  isActive?: boolean;
}


export interface ReportCaptions {
  startDate?: string;
  endDate?: string;
  course?: string;
}

export interface BaseReportCaption {
  generate: string;
  cancel: string;
  reportName: string;
}

export interface ReportMenuCaption {
  teeTime: string;
  member: string;
  tournament: string;
  instructor: string;
  statistics: string;
  transactionLog: string;
  retail: string;
  CommissionGraduityServicecharge: string;
}

export interface HTMLDomElement extends Element {
  name?: string;
}

export interface ReportAPIModel {
  code: string;
  format: ReportDownloadFormat;
  downloadFileName: string;
  parameters: { [key: string]: string };  //Dictionary<string,string>
  uRIParams: { [key: string]: string };   //Dictionary<string,string>
  filterBody: any;
  dateFormat: string;
}





// REPORTS CONTROL BUILDER MODELS
export interface ControlValidator {
  addRequiredValidation(message: string): void;
}

export interface DropDownControl extends ControlValidator {
  addDefaultValue(value: string | number): DropDownControl;
}

export interface DatePickerControl extends ControlValidator { // yet to implement
  addDefaultValue(value: string | number): DropDownControl;
  preventFutureDate(): ControlValidator;
  preventHistoricalDate(): ControlValidator;
}

export interface DateRangeControl {
  addDefaultValue(value: string | number);
  preventFutureDate(): ControlValidator;
  preventHistoricalDate(): ControlValidator;
}


export interface ReportControls {
  addDateRange(startFromValue?:Date, maxDate?:Date,startminDate?: Date): DateRangeControl;
  addDate(label: string, controlName: string, value?: Date): DatePickerControl;
  addDropDown(label: string, controlName: string, data: Promise<DropDownData[]>): DropDownControl;
  addToggle(label: string, controlName: string, value?: boolean): void;
  addMultiSelectDropDown(label: string, controlName: string, data: Promise<DropDownData[]>): DropDownControl;
  addTextField(label: string, controlName: string, maxlength: number): ControlValidator;
  addNumberField(label: string, controlName: string, value?: number, maxlength?: number): ControlValidator;
  addCustomControlTemplate(customTemplate: CustomTemplate, label?:string): void;
  addRadio(label:string, controlName: string, data:any, value?:number);
  addButtonToggle(label:string, controlName: string, data:any, value?:number);
  addTextArea(label: string, controlName: string, maxlength: number): ControlValidator;
  addDateValue(startFromValue?:Date, maxDate?:Date,startminDate?: Date): DateRangeControl;
}


export class ReportControl {
  type: string;
  label: string;
  name: string;
  validations: Validations[];
  data: Promise<DropDownData[]>;
}

export class Validations {
  name: string;
  validator: Validator;
  message: string;
}


// FAST REPORTS MODELS

export interface ReportUIConfig {
  dropDownFilterName?: string;
  startDatePicker: boolean;
  endDatePicker: boolean;
  dropDownFilters?: Promise<DropDownData[]>;
  inActiveToggle: boolean;
  inActiveToggleName?: '';
  pageBreakToggle: boolean;
  timePicker?: boolean;
  layout: 'PORTRAIT' | 'LANDSCAPE';
  allowFutureDate?: boolean;
}

export class ReportUIConfig_ {
  controls: ReportControl[] = [];
  layout: 'PORTRAIT' | 'LANDSCAPE' = 'PORTRAIT';
  summary?: boolean = false;
}


export interface ReportDataMapper {
  key: string;
  description: string;
}


// export class DropDownDataMapper {
//   route: string = GolfRoutes.GetCourses;
//   host: string = GolfApiHosts.GolfSchedule;
//   id: string = 'id';
//   description: string = 'courseName';
//   multiSelect: boolean = false;
// }


// Report Core Models 

export class ReportSelector_ {
  id: number;
  group: ReportGroup;
  code: ReportCode;
  value: string;
  breakPointNumber: ReportBreakPoint;
  isAuthorized?: boolean = true;   // redudant
  hideResetButton?: boolean = false;
}

export class DropDownData {
  id: number;
  description: string;
  code?: string;
  isActive?: boolean = true;
  showInDropDown?: boolean = true;
}

export class RadioData{
    key: number;
    label: string;
}

export class ButtonToggleData{
  key: number;
  label: string;
}
export class TranslogReportData {

  id: TransLogType;
  description: string;
}


export class CartCardFilter{
  ScheduleTeeTimeIds: number[];
  startDate:number;
  endDate:number;
  courseId:number;
}

export class CustomFieldReportsUIModel {
  dropDownLabel: string;
  dropDownData: Promise<DropDownData[]>;
}

export type ReportDownloadFormat = 'PDF' | 'WORD' | 'EXCEL' | 'IMAGE' | 'HTML' | 'CSV' |'RAWDATA';

export interface ReportAPIModel {
  code: string;
  format: ReportDownloadFormat;
  downloadFileName: string;
  parameters: { [key: string]: string };  //Dictionary<string,string>
  uRIParams: { [key: string]: string };   //Dictionary<string,string>
  filterBody: any;
  dateFormat: string;
}

export interface ReportParams {
  [parameter: string]: string | number | boolean;
}

export class ReportAPIOptions {
  code: string;
  format?: ReportDownloadFormat = 'HTML';
  params: ReportParams[];
  URIParams: ReportParams[];
  filters: any;
  pageBreak: boolean;
  rawDataExport?: boolean = false;
}

export class LostBusinessFilter {
  fromBookDate : Date;
  toBookDate : Date;
  fromLostDate : Date;
  toLostDate : Date;
  bookingStatus : number[];
  cancelType : number[];
  lostTo : number[];
  accounts : number[];
  saleManager : number[];
  conferenceManager : number[];
  cateringManager  : number[];
}

export interface AreaCode {
  id: number;
  code: string;  
}

export interface VIPType { 
  id:number,
  code: string;
  name: string;
  listOrder: any;
  isActive: boolean;
  includeOnDailyReport: boolean;
  allowMobileCICO:boolean;
  }

export interface BookingName {
      id: number;
      name: string;
      bookingId: string;
  }

export interface GuestsModel 
  {
    guestId: string;
    guestName: string;

  }

export interface ARAccount
  {
    id: number;
    code: string;
    name: string;
    discountCategoryId: number;
  }

export interface ARDiscountCategory
  {
    id: number;
    code: string;
    description: string;
  }


