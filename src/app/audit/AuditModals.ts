
export interface GridData {
    status: PendingAction;
    displayName: string;
    tableOptions? : any;
    options? : any;
    dataCount? : number;
    isLoaded : boolean;
}

export enum GridAction {
    CheckInCheckOut = 1,
    Move,
    CheckOut,
    UndoCheckIn,
    Settle,
    ReOpen,
    UndoCheckOut,
    CancelTransaction
}

export enum PendingAction {
    ScheduledWithDeposit = 1,
    CheckedInAppointment,
    CheckOutWithoutTransaction,
    OpenTransaction
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
   
  }

  export enum PMSSystem {
    VisualOne = 1,
        Stay,
        LMS
  }