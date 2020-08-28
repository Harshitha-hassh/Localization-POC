import { Injectable } from '@angular/core';
import { AuthenticationCommunication } from '../../communication/services/authentication.service';
import { PatchOperation, PatchJson } from 'src/app/core/utilities';
import { API } from '../../models/property-settings.model';
// import { PaymentConfiguration } from 'src/app/common/shared/retail.modals';
import { PaymentCommunication } from '../../communication/services/payment.service';

@Injectable()
export class PropertySettingDataService {

    constructor(private _authenticationCommunication: AuthenticationCommunication, private _paymentCommunication: PaymentCommunication) { }

    public getAllPropertySetting(_propertyId: number): Promise<API.PropertySetting> {
        let result = this._authenticationCommunication.getPromise<API.PropertySetting>(
            { route: RetailApiRoute.GetAllPropertySettings, uriParams: { propertyId: _propertyId } });
        return result;
    }


    public async GetPaymentConfigurationByProperty(propertyId : number): Promise<any[]> {
        let result = this._paymentCommunication.getPromise<any[]>(
            { route: RetailApiRoute.GetPaymentConfigurationByProperty, uriParams: { propertyId: propertyId } });
        return result;
    }

    public  patchPropertySetting(_propertyId: number,body: Partial<API.PropertySetting>): Promise<boolean> {
        let patchJson: PatchJson = {
            op: PatchOperation.replace,
            path: "/ActivateRetailInterface",
            value: body.activateRetailInterface
        };      

        let result = this._authenticationCommunication.patchPromise<boolean>({ route: RetailApiRoute.UpdatePropertySetting,
            uriParams:{propertyId:_propertyId}
            , body: [patchJson] });
        return result;
    }

    public GetAllPropertyConfigurationSettings(_propertyConfigurationSettings: API.PropertyConfigurationSettings<any>): Promise<API.PropertyConfigurationSettings<any>> {
        let result = this._authenticationCommunication.getPromise<API.PropertyConfigurationSettings<any>>(
            { 
                route: RetailApiRoute.GetAllPropertyConfigurationSettings,
                uriParams: {
                    configurationName: _propertyConfigurationSettings.configurationName,
                    propertyId: _propertyConfigurationSettings.propertyId,
                    productId: _propertyConfigurationSettings.productId
                }
            });
        return result;
    }
}