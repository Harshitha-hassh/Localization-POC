export namespace API {
    export interface PropertySetting {
        id: number;
        propertyId: number;
        propertyDate: string;
        activateRetailInterface: boolean;
        vatEnabled: boolean;
    }
    export interface PropertyConfigurationSettings<T> {
        id: number;
        propertyId: number;
        productId: number;
        configurationName: string;
        configValue: {GoogleMapApiKey:string,  ClientId:string};
        defaultValue: T;
        lastModifiedBy: T;
        lastModifiedDate: Date;
    }
}
