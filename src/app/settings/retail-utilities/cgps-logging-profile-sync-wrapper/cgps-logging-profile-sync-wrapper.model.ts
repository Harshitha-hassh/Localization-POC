export namespace UI {
    export interface FailedProfile {
        guestId: string
        firstName: string,
        lastName: string,
        description: string,
        retryCount: string,
        syncDirection: Enum.PlatformSyncEvent,
        sync: string
    }
}

export namespace API {
    export interface FailedProfile {
        id: number
        guestId: string,
        guestFirstName: string,
        guestLastName: string,
        failureCode: string,
        failureReason: string,
        retryCount: number,
        syncDirection: Enum.PlatformSyncEvent
    }

    export interface ProfileSyncInfo {
        guestId: any,
        startDate: string,
        enddate: string,
        syncDirection: number
    }
}

export namespace Enum {
    export enum PlatformSyncEvent {
        outbox,
        inbox
    }
}

export interface TableGridOptions { 
    actions: { type: any; disabled: any; }[]; 
    defaultsortingColoumnKey: string; 
    showTotalRecords: boolean; 
    defaultSortOrder: any; 
    columnFreeze: { firstColumn: boolean; lastColumn: boolean; }; 
    isDragDisabled: boolean; 
    isHeaderCheckboxAllowed: boolean; 
    checkboxKey: string; 
    ignoreSort: boolean; 
}
