export enum QuickIdConfigSetting {
    retailtransactions= "QUICKID_RETAILTRANSACTIONS"
}

export interface ConfigData {
    id: number;
    isActive?: boolean;
    moduleId: number;
    switch: string;
    switchType?: string;
    value:  any;
}