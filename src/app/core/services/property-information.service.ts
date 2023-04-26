import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { RetailStandaloneLocalization } from '../localization/retailStandalone-localization';
import { API } from '../../shared/models/property-settings.model';
import { CommonPropertyInformation } from 'src/app/common/shared/services/common-property-information.service';

@Injectable({
    providedIn: 'root'
})
export class PropertyInformation extends CommonPropertyInformation {

    constructor(public localization: RetailStandaloneLocalization) {
        super(localization);
        this.SetDefaultDataOnLoad();
    }


    public SetSupportedPMAgentVersion(supportedPMAgentVersion) {
        sessionStorage.setItem('supportedPMAgentVersion', _.cloneDeep(JSON.stringify(supportedPMAgentVersion)));
    }

    public GetPaymentConfigValueByKey(configKey: string, outletId: number): string {
        let payConfigValue = '';
        var payConfig = this._paymentConfiguration.find(r => r.propertyId == this._propertyId && r.outletId == outletId && r.configKey == configKey);
        if (!payConfig) { // Get default pay configuration
            payConfigValue = this._paymentConfiguration.find(r => r.propertyId == 0 && r.outletId == 0 && r.configKey == configKey).configValue;
        }
        else {
            payConfigValue = payConfig.configValue;
        }
        return payConfigValue;
    }

    public SetPropertySetting(settings: API.PropertySetting) {
        if (settings) {
            this._useRetailInterface = settings.activateRetailInterface;
            this._VATEnabled = settings.vatEnabled;
        } else {
            this._useRetailInterface = false;
            this._VATEnabled = false;
        }
        sessionStorage.setItem('useRetailInterface', _.cloneDeep(this._useRetailInterface).toString());
        sessionStorage.setItem('VATEnabled', _.cloneDeep(this._VATEnabled).toString());
        sessionStorage.setItem('productVersion', settings['productVersion']);
        sessionStorage.setItem('userProductVersion', settings['userProductVersion']);
    }

    public SetDefaultDataOnLoad() {
        // Setting propety Date
        const propertyData: any = sessionStorage.getItem('propertyDate');
        if (propertyData) {
            this._currentDate = this.localization.getDate(propertyData);
        } else {
            this._currentDate = this.localization.getCurrentDate();
        }
        this._currentDate.setHours(0, 0, 0, 0);

        // Setting Retail-Interface switch value
        const retailSwitch: string = sessionStorage.getItem('useRetailInterface');
        if ((retailSwitch && retailSwitch.toLowerCase() == 'true')) {
            this._useRetailInterface = true;
        } else {
            this._useRetailInterface = false;
        }

        // Payment Configuration
        const paymentConfig: string = sessionStorage.getItem('paymentConfiguration');
        if (paymentConfig && JSON.parse(paymentConfig)) {
            this._paymentConfiguration = JSON.parse(paymentConfig);
        } else {
            this._paymentConfiguration = [];
        }

        // Set PropertyId
        const propertyId = this.GetPropertyInfoByKey('PropertyId');
        if (propertyId) {
            this._propertyId = Number(propertyId);
        }
    }

    public GetPropertyInfoByKey(name: string) {
        const nameEQ = name + '=';
        const propertyInfo = sessionStorage.getItem('propertyInfo')
        if (propertyInfo != null) {
            const ca = propertyInfo.split(';');

            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trim();
                while (c.charAt(0) == ' ') { c = c.substring(1, c.length); }
                if (c.indexOf(nameEQ) == 0) { return c.substring(nameEQ.length, c.length); }
            }
        }
        return null;
    }

    public SetPropertyConfiguration(settings) {
        sessionStorage.setItem('propConfig', JSON.stringify(settings.configValue));
    }

    public GetPropertyConfiguration() {
        const config = sessionStorage.getItem('propConfig');
        return config && JSON.parse(config);
    }
}
