import { FormGroup } from '@angular/forms';


export interface LocalizedMonthsModel {
    id: number;
    short: string;
    long: string;
    code: string;
}

export interface localizationJSON {
    alertPopup: any;
    booking: any;
    calendar: any;
    common: any;
    header: any;
    reports: any;
    settings: any;
    shop: any;
    bookAppointment: any;
    breakpoint: any;
    utilities: any;
}

export interface Calendar {
    Sun: string;
    Mon: string;
    Tue: string;
    Wed: string;
    Thu: string;
    Fri: string;
    Sat: string;
    Sunday: string;
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    January: string;
    February: string;
    March: string;
    April: string;
    May: string;
    June: string;
    July: string;
    August: string;
    September: string;
    October: string;
    November: string;
    December: string;
    Jan: string;
    Feb: string;
    Mar: string;
    Apr: string;
    Jun: string;
    Jul: string;
    Aug: string;
    Sep: string;
    Oct: string;
    Nov: string;
    Dec: string;
}

export interface DaysModel {
    id: number;
    short: string;
    long: string;
    code: string;
    longCode?: string;
}

export enum ContactType {
    phone = 1,
    email = 2,
    office = 3
}

export enum AlertType {
    Success = 1,
    Warning = 2,
    Error = 3,
    WellDone = 4,
    Info = 5,
    AccessDenied = 6,
    Done = 7
}

export enum AlertAction {
    CONTINUE = 'CONTINUE',
    CANCEL = 'CANCEL',
    YES = 'YES',
    NO = 'NO',
    RESV = 'RESEV',
    ALL = "ALL"
}

export enum ButtonType {
    YesNo = 1,
    YesNoCancel = 2,
    OkCancel = 3,
    Ok = 4,
    SaveCancel = 5,
    Continue = 6,
    ContinueCancel = 7,
    AddCancel = 8,
    Save = 9,
    Update = 10,
    Custom = 11
}

export interface ButtonValue {
    label: string;
    type: string;
    disabledproperty?: boolean;
    customclass?: string;
}

export interface BaseResponse<T> {
    result: T;
    errorCode: number;
    errorDescription: string;
    successStatus: boolean;
    propertyId: number;
    outletId: number;
}

export interface KeyValuePair {
    key: any;
    value: any;
  }
export interface ImageData {
    id: number;
    referenceType: string;
    referenceId: number;
    sequenceNo: number;
    contentType: string;
    data: any[];
    thumbnailData: any[];
}

export interface clientInfoDisplay {
    name: any;
    age: any;
    gender: any;
    email: any[];
    phone: any[];
    address: any;
}

export interface ClientLabel {
    Id: number;
    FirstName: string;
    LastName: string;
}
