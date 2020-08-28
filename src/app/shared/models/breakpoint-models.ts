
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
    UserSetup = 2300
}

export const enum ReportBreakPoint {
}

export const CipherKey = "AGYS SNC Key";
