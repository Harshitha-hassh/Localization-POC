import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { RetailStandaloneLocalization } from '../localization/retailStandalone-localization';
import { API } from '../../shared/models/property-settings.model';

@Injectable({
    providedIn: 'root'
})
export class PropertyInformation {

    private currentDate: Date;
    private useRetailInterface: boolean;
    private VATEnabled: boolean;
    private paymentConfiguration: any[];
    private propertyId: number;

    constructor(private localization: RetailStandaloneLocalization) {
        this.SetDefaultDataOnLoad();
    }

    public get IsVATEnabled() {
        return _.cloneDeep(this.VATEnabled);
    }

    public get CurrentDate() {
        return _.cloneDeep(this.currentDate);
    }

    public get UseRetailInterface() {
        return _.cloneDeep(this.useRetailInterface);
    }

    public get PropertyId() {
        return _.cloneDeep(this.propertyId);
    }

    private set UpdateDate(newDate: Date) {
        this.currentDate = this.localization.getDate(newDate);
        this.currentDate.setHours(0, 0, 0, 0);
    }

    public get CurrentDTTM() {
        const now = this.localization.getCurrentDate();
        return new Date(this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            this.currentDate.getDate(), now.getHours(), now.getMinutes());
    }

    public SetPropertyDate(newDate: Date, updatelocalstore: boolean = true) {
        this.UpdateDate = newDate;
        if (updatelocalstore) {
            sessionStorage.setItem('propertyDate', _.cloneDeep(this.currentDate).toString());
        }
    }

    public SetPropertyId(propertyId: number) {
        this.propertyId = propertyId;
    }

    public SetPropertySetting(settings: API.PropertySetting) {
        if (settings) {
            this.useRetailInterface = settings.activateRetailInterface;
            this.VATEnabled = settings.vatEnabled;
        } else {
            this.useRetailInterface = false;
            this.VATEnabled = false;
        }
        sessionStorage.setItem('useRetailInterface', _.cloneDeep(this.useRetailInterface).toString());
        sessionStorage.setItem('VATEnabled', _.cloneDeep(this.VATEnabled).toString());
        sessionStorage.setItem('productVersion', settings['productVersion']);
        sessionStorage.setItem('userProductVersion', settings['userProductVersion']);
    }

    public SetPaymentConfiguration(payConfig: any[]) {
        this.paymentConfiguration = [];
        if (payConfig && payConfig.length > 0) {
            this.paymentConfiguration = payConfig;
        }
        sessionStorage.setItem('paymentConfiguration', _.cloneDeep(JSON.stringify(this.paymentConfiguration)));
    }

    public SetSupportedPMAgentVersion(supportedPMAgentVersion: string) {
        sessionStorage.setItem('supportedPMAgentVersion', supportedPMAgentVersion);
    }

    public GetPaymentConfigValueByKey(configKey: string, outletId: number): string {
        let payConfigValue = '';
        const payConfig = this.paymentConfiguration.find(r =>
            r.propertyId == this.propertyId && r.outletId == outletId && r.configKey == configKey);
        if (!payConfig && this.paymentConfiguration.length > 0) { // Get default pay configuration
            payConfigValue = this.paymentConfiguration.find(r =>
                r.propertyId == 0 && r.outletId == 0 && r.configKey == configKey).configValue;
        } else {
            payConfigValue = payConfig && payConfig.configValue;
        }
 // Removing Trailing slash, since we don't need them for GolfHost
        payConfigValue = payConfigValue && payConfigValue.slice(0, payConfigValue.length - 1);
        return payConfigValue;
    }

    private SetDefaultDataOnLoad() {
        // Setting propety Date
        const propertyData: any = sessionStorage.getItem('propertyDate');
        if (propertyData) {
            this.currentDate = this.localization.getDate(propertyData);
        } else {
            this.currentDate = this.localization.getCurrentDate();
        }
        this.currentDate.setHours(0, 0, 0, 0);

        // Setting Retail-Interface switch value
        const retailSwitch: string = sessionStorage.getItem('useRetailInterface');
        if ((retailSwitch && retailSwitch.toLowerCase() == 'true')) {
            this.useRetailInterface = true;
        } else {
            this.useRetailInterface = false;
        }

        // Payment Configuration
        const paymentConfig: string = sessionStorage.getItem('paymentConfiguration');
        if (paymentConfig && JSON.parse(paymentConfig)) {
            this.paymentConfiguration = JSON.parse(paymentConfig);
        } else {
            this.paymentConfiguration = [];
        }

        // Set PropertyId
        const propertyId = this.GetPropertyInfoByKey('PropertyId');
        if (propertyId) {
            this.propertyId = Number(propertyId);
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
