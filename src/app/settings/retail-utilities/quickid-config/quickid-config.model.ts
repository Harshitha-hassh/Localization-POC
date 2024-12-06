export enum QuickIdConfigSetting {
    retailtransactions= "QUICKID_RETAILTRANSACTIONS",
    discountUpdateRemove= "QUICKID_UPDATEREMOVEDISCOUNTS"
}

export interface ConfigData {
    id: number;
    isActive?: boolean;
    moduleId: number;
    switch: string;
    switchType?: string;
    value:  any;
}