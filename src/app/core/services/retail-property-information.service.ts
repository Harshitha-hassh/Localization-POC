import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { GiftCardConfiguration, GiftCardConfigurationStore } from 'src/app/retail/shared/service/payment/payment-model';
import { Subject, ReplaySubject } from 'rxjs';
import { CommonPropertyInformation } from 'src/app/common/shared/services/common-property-information.service';
import { PaymentConfiguration } from 'src/app/common/shared/shared/business/view-settings.modals';
import { PropertyConfiguration } from 'src/app/retail/shared/business/view-settings.modals';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';

@Injectable()
export class RetailPropertyInformation extends CommonPropertyInformation {

    public _giftCardConfiguration: GiftCardConfigurationStore;

    constructor(public localization: RetailLocalization) {
        super(localization);
        this.SetDefaultDataOnLoad();
    }

    public SetPropertyConfiguration(settings: PropertyConfiguration<any>) {
        sessionStorage.setItem('propConfig', JSON.stringify(settings.configValue));
    }

    public SetPaymentConfiguration(payConfig: PaymentConfiguration[]) {
        this._paymentConfiguration = [];
        if (payConfig && payConfig.length > 0) {
            this._paymentConfiguration = payConfig;
        }
        sessionStorage.setItem('paymentConfiguration', _.cloneDeep(JSON.stringify(this._paymentConfiguration)));
    }

    public SetGiftCardConfiguration(giftcardConfig: GiftCardConfiguration) {
        this._giftCardConfiguration = null;
        if (giftcardConfig) {
            this._giftCardConfiguration = { activateGiftCardInterface: giftcardConfig.activateGiftCardInterface, giftCardType: giftcardConfig.giftCardType };
        }
        sessionStorage.setItem('giftCardConfiguration', _.cloneDeep(JSON.stringify(this._giftCardConfiguration)));
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

    public SetDefaultDataOnLoad() {
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

        // GiftCard Configuration
        let giftCardConfig: string = sessionStorage.getItem('giftCardConfiguration');
        if (giftCardConfig && JSON.parse(giftCardConfig)) {
            this._giftCardConfiguration = JSON.parse(giftCardConfig);
        }
        else {
            this._giftCardConfiguration = null;
        }


        //VAT Enable
        let VATEnableSwitch: string = sessionStorage.getItem('VATEnabled');
        if (VATEnableSwitch && VATEnableSwitch.toLowerCase() == 'true') {
            this._VATEnabled = true;
        } else {
            this._VATEnabled = false;
        }

        // Set PropertyId
        var propertyId = this.GetPropertyInfoByKey('PropertyId');
        if (propertyId) {
            this._propertyId = Number(propertyId);
        }
    }
}
