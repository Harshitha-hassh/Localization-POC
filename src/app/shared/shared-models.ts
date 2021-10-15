import { FormGroup } from '@angular/forms';
import { ReportAPIModel } from '../retail/retail-reports/business/report.modals';
import { SpaServiceLocation, TherapistDetails, SpaServices, PackageDetail, ServiceAddOns, LinkCode, SystemConfiguration, BreakType, ReportAPIOptions } from '../retail/retail.modals';



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
    userConfig: any;
    retailsetup: any;
    setting: any;
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

export const enum ContactTypeId{
    Cell = 1,
    Home = 2,
    Work =3,
    Personal = 9,
    Office = 10
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
export const enum ImgRefType {
	player = 'PLAYER',
	guest = 'GUEST',
	retailItem = 'RETAILITEM'
}
export interface Imagedata {
    id: number;
    referenceType: string;
    referenceId: number;
    sequenceNo: number;
    contentType: string;
    data: string;
    thumbnailData: string;
    imageReferenceId: string;
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

export interface ManagementData {
    location: SpaServiceLocation[];
    therapist: TherapistDetails[];
    service: SpaServices[];
    package: PackageDetail[];
    client: ClientDetail[];
    addOn: ServiceAddOns[];
    linkCode: LinkCode[];
    appointmentConfigurations: SystemConfiguration[];
    breakType: BreakType[];
}

export interface ClientDetail {
    id: number;
    guestId?: string;
    title: string;
    firstName: string;
    FirstName?: string;
    lastName?: string;
    LastName?: string;
    pronounce: string;
    gender: string;
    dateOfBirth: string;
    comments: string;
    bypassClientScheduling: boolean;
    propertyId: number;
    subPropertyId: number;
    customField1: any;
    customField2: any;
    customField3: any;
    customField4: any;
    customField5: any;
    genderPreference: string;
    lastChangeId?: string;
    interfaceGuestId: string;
    priceTypeId: number;
    loyaltyDetail: LoyaltyDetail[];
}

export interface LoyaltyDetail {
    patronId: string;
    rank: string;
}

export interface HandleResponse {
    status: string;
    errorMessage: string;
    paymentHandle: PayHandle[];
}
export interface PayHandle {
    handle: string;
    inquiryInfo: Inquiry; //(as passed in request)
    name: string;
    type: string;
    balance: number;
    isBalanceVisible: boolean
    isPartialTenderAllowed: boolean;
    isRefundable: boolean;
    additionalAttributes: object;
    allowedAPIs: string[];
}
export interface Inquiry {
    id?: string;
    type?: string; //(Required)
    name?: string;
    cardData?: CardData;
    TenderId?: string;
}

export interface CardData {
    track1?: string;
    track2?: string
    encryptedData: string;
}
export interface HandleRequest {
    tenderId: string; // (Required)
    inquiryInfo?: Inquiry; // (Required)
}

export interface GuestRetailTransactionHistory {
    transaction: Transaction[];
    itemDescription: any;
}

export interface Transaction {
    id: number;
    transactionData: TransactionData;
    transactionDetails: TransactionDetail[];
    transactionPayments: any[];
}

export interface TransactionDetail {
    id: number;
    transactionId: number;
    lineNumber: number;
    itemId: number;
    serviceId: number;
    staffId: number;
    staffType?: any;
    quantitySold: number;
    unitPrice: number;
    discount: number;
    commission?: any;
    serviceChargeGratuity?: any;
    tax: number;
    totalAmount: number;
    outletId: number;
    propertyId: number;
    subPropertyId: number;
    itemDescription:string;
}


export interface PhoneNumber {
    id: number;
    contactTypeId: number;
    clientId: number;
    countryCode: string | number;
    number: string;
    extension: string;
    isPrivate: boolean;
    isPrimary: boolean;
    propertyId: number;
    subPropertyId: number;
  }
  

export interface Email {
    id: number;
    contactTypeId: number;
    clientId: number;
    emailId: string;
    isPrivate: boolean;
    isPrimary: boolean;
    propertyId: number;
    subPropertyId: number;
  }
  

export interface NotificationModel {
    transactionId : number,
    action : string,
    emailId : string,
    phoneNumber : string,
    canSendSMS : boolean,
    canSendemail : boolean,
    isManual: boolean,
    reportQuery : ReportAPIModel
    }

export interface TransactionData {
    id: number;
    ticketNumber: string;
    transactionType: string;
    status: string;
    transactionDate: string;
    clerkId: number;
    totalPrice: number;
    totalTax: number;
    totalAmount: number;
    guestId: number;
    memberId: number;
    comment: string;
    stayId: number;
    isTaxExempt: boolean;
    isVoided: boolean;
    outletId: number;
    gratuity: number;
    serviceCharge: number;
    discount: number;
    propertyId: number;
    subPropertyId: number;
    retailTicketNumber: string;
}

export const enum PatronInfoSearchResultType {
    EDITEXISTINGPATRON = 0,
    PATRONNOTFOUND,
    PATRONFOUND,
    UPDATECMSDATAONEXISTING
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
export interface Addresscomponent {
    long_name: string;
    short_name: string;
    types: string[];
}