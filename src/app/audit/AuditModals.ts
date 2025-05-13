import { CashDrawerRegisterStatus } from "../retail/shop/cash-drawer-management/cash-drawer-management.model";

export interface GridData {
    status: PendingAction;
    displayName: string;
    tableOptions? : any;
    options? : any;
    dataCount? : number;
    isLoaded : boolean;
    linkOptions: boolean;
}

export enum GridAction {
    CheckInCheckOut = 1,
    Move,
    CheckOut,
    UndoCheckIn,
    Settle,
    ReOpen,
    UndoCheckOut,
    CancelTransaction,
    Close,
    CloseCashDrawer
}

export enum PendingAction {
    ScheduledWithDeposit = 1,
    CheckedInAppointment,
    CheckOutWithoutTransaction,
    OpenTransaction,
    RevenuePosting,
    CashDrawer
  }

  export interface AppointmentData{
    GuestName : string;
    Service : string;
    Package : string;
    Staff : string;
    Appointmenttime : string;
    Location : string;
    Status : string;
    StatusCode : string;
    AppointmentId : string;
    ServiceId : number;
    PackageId : number;
    TherapistId : number[];
    LocationId : number;
    ClientId : number;
    Price : any;
    StartTime : any;
    EndTime : any;
    ServiceGroupId : number;
    MultipackId : number;
  }

  export enum ManagementDataType {
    Location = 1,
    Service,
    Therapist,
    Package,
    Client
  }

  export interface NotifyDayEnd{
    PMSEndPoint?: string;
    PostingRoomNumber?: string;
    DateTime : string;
    PMSSystem?  : PMSSystem;
    NightAuditDateTime: string;
   
  }

  export enum PMSSystem {
    VisualOne = 1,
        Stay,
        LMS
  }
  export class ErrorCodes{
    static UNABLE_TO_ROLL_TO_FUTURE_DATE = '101917';
    static NEWDATE_LESS_THAN_PROPERTYDATE = '101918';
  }
  
  export interface CashDrawerAudit {
    cashDrawerStatusId: number;
    cashDrawerDesc: string;
    cashFloat: string;
    otherTenders: string;
    status: string;
  }
  
  export interface CashDrawerAuditAPI {
    cashDrawerStatusId: number;
    cashDrawerDescription: string;
    isCashFloatBalanced: boolean;
    isOtherTendersBalanced: boolean;
    status: CashDrawerRegisterStatus;
  }