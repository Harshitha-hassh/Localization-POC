import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Localization } from '../localization/Localization';
import { API } from '../../shared/models/property-settings.model';

@Injectable({
    providedIn: 'root'
})
export class PropertyInformation {

    private _currentDate: Date;
    private _useRetailInterface: boolean;
    private _VATEnabled: boolean;
    private _paymentConfiguration: any[];
    private _propertyId: number;

    constructor(private localization: Localization) {
        this.SetDefaultDataOnLoad();
    }

    public get IsVATEnabled() {
      return _.cloneDeep(this._VATEnabled);
  }

    public get CurrentDate() {
        return _.cloneDeep(this._currentDate);
    }

    public get UseRetailInterface() {
        return _.cloneDeep(this._useRetailInterface);
    }

    public get PropertyId() {
        return _.cloneDeep(this._propertyId);
    }

    private set UpdateDate(newDate: Date) {
        this._currentDate = this.localization.getDate(newDate);
        this._currentDate.setHours(0, 0, 0, 0);
    }

    public get CurrentDTTM() {
        const now = this.localization.getCurrentDate();
        return new Date(this._currentDate.getFullYear(), this._currentDate.getMonth(), this._currentDate.getDate(), now.getHours(), now.getMinutes());
    }

    public SetPropertyDate(newDate: Date, updatelocalstore: boolean = true) {
        this.UpdateDate = newDate;
        if (updatelocalstore) {
            sessionStorage.setItem('propertyDate', _.cloneDeep(this._currentDate).toString());
        }
    }

    public SetPropertyId(propertyId: number) {
        this._propertyId = propertyId;
    }

    public SetPropertySetting(settings: API.PropertySetting) {
        if (settings) {
            this._useRetailInterface = settings.activateRetailInterface;
            this._VATEnabled = settings.vatEnabled;
        }
        else {
            this._useRetailInterface = false;
            this._VATEnabled = false;
        }
        sessionStorage.setItem('useRetailInterface', _.cloneDeep(this._useRetailInterface).toString());
        sessionStorage.setItem('VATEnabled', _.cloneDeep(this._VATEnabled).toString());
        sessionStorage.setItem('productVersion', settings['productVersion']);        
    }

    public SetPaymentConfiguration(payConfig: any[]) {
        this._paymentConfiguration = [];
        if (payConfig && payConfig.length > 0) {
            this._paymentConfiguration = payConfig;
        }
        sessionStorage.setItem('paymentConfiguration', _.cloneDeep(JSON.stringify(this._paymentConfiguration)));
    }

    public GetPaymentConfigValueByKey(configKey: string, outletId: number): string {
        let payConfigValue = '';
        var payConfig = this._paymentConfiguration.find(r => r.propertyId == this._propertyId && r.outletId == outletId && r.configKey == configKey);
        if (!payConfig && this._paymentConfiguration.length > 0) { // Get default pay configuration
            payConfigValue = this._paymentConfiguration.find(r => r.propertyId == 0 && r.outletId == 0 && r.configKey == configKey).configValue;
        }
        else {
            payConfigValue = payConfig && payConfig.configValue;
        }
        payConfigValue = payConfigValue && payConfigValue.slice(0, payConfigValue.length - 1); //Removing Trailing slash, since we don't need them for GolfHost
        return payConfigValue;
    }

    private SetDefaultDataOnLoad() {
        // Setting propety Date
        let propertyData: any = sessionStorage.getItem('propertyDate');
        if (propertyData) {
            this._currentDate = this.localization.getDate(propertyData);
        }
        else {
            this._currentDate = this.localization.getCurrentDate();
        }
        this._currentDate.setHours(0, 0, 0, 0);

        // Setting Retail-Interface switch value
        let retailSwitch: string = sessionStorage.getItem('useRetailInterface');
        if ((retailSwitch && retailSwitch.toLowerCase() == 'true')) {
            this._useRetailInterface = true;
        }
        else {
            this._useRetailInterface = false;
        }

        // Payment Configuration
        let paymentConfig: string = sessionStorage.getItem('paymentConfiguration');
        if (paymentConfig && JSON.parse(paymentConfig)) {
            this._paymentConfiguration = JSON.parse(paymentConfig);
        }
        else {
            this._paymentConfiguration = [];
        }

        // Set PropertyId
        var propertyId = this.GetPropertyInfoByKey('PropertyId');
        if (propertyId) {
            this._propertyId = Number(propertyId);
        }
    }

    public GetPropertyInfoByKey(name: string) {
        var nameEQ = name + "=";
        var propertyInfo = sessionStorage.getItem("propertyInfo")
        if (propertyInfo != null) {
            var ca = propertyInfo.split(";");

            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }
}
