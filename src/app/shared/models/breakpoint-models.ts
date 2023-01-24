
export interface UserBreakPoint {
    userRoleId: number;
    breakPointNumber: number;
    allow: boolean;
    view: boolean;
}

export interface BreakPointResult {
    isAllow: boolean;
    isViewOnly: boolean;
    breakPointNumber?: number;
}

export enum BreakPoint{
    ShopScreen = 3000,

    //user module    
  UserSetup = 2300,
  UserRoleSetUp = 2305,
  UserRoleConfiguration = 2310,

  ReceiptConfiguration = 7080,
  AddNewClientProfile = 600,
  EditClientProfile = 605,
  DayEnd = 2430,
  UserSessionConfiguration = 7085,
  TransactionLog = 8090,
  CombineGuestRecords=2435,
  InventorySync = 15170
}

export const enum ReportBreakPoint {
}

export const CipherKey = "AGYS SNC Key";
