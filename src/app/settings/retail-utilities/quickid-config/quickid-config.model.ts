export enum QuickIdConfigSetting {
    retailtransactions= "QUICKID_RETAILTRANSACTIONS",
    discountUpdateRemove= "QUICKID_UPDATEREMOVEDISCOUNTS",
    priceOverride = "QUICKID_PRICEOVERRIDE",
    couponRedemption = "QUICKID_COUPONREDEMPTION"
}

export interface ConfigData {
    id: number;
    isActive?: boolean;
    moduleId: number;
    switch: string;
    switchType?: string;
    value:  any;
}