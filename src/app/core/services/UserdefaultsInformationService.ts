import { Injectable } from '@angular/core';
import { Outlet } from 'src/app/common/shared/retail.modals';
import { DefaultUserConfiguration } from 'src/app/common/shared/shared.modal';
import { Localization } from 'src/app/common/localization/localization';
import { RetailManagementCommunication } from 'src/app/shared/communication/services/retailmanagement.service';


@Injectable({
  providedIn: 'root'
})

export class UserdefaultsInformationService {

  private outlets: Outlet[];
  private captions: any;
  private defaultUserConfig: DefaultUserConfiguration;
  constructor(
    private _retailmanagementCommunication: RetailManagementCommunication,
    private _localization: Localization) {
    this.captions = this._localization.captions.settings.utilities;
  }

  public syncDefaultValues(userId) {
    this.defaultConfig(userId);
    this.setOutlets();
  }

  public get DefaultUserConfig() : DefaultUserConfiguration{
    return this.defaultUserConfig;
  }


  private GetDefaultUserConfiguration(userId: string): Promise<DefaultUserConfiguration> {
    return this._retailmanagementCommunication.getPromise({
      route: RetailApiRoute.GetDefaultUserConfiguration,
      uriParams: { 'userId': userId }
    })
  }
  private defaultConfig(userId) {
    this.GetDefaultUserConfiguration(userId).then((d) => {
      this.defaultUserConfig = d;
      sessionStorage.setItem("userSessionConfigInfo", JSON.stringify(d));
    });
  }
  private setOutlets() {
    this.fetchOutlets().then((o) => {
      this.outlets = o;
      sessionStorage.setItem("outlets", JSON.stringify(o));
    });
  }

 
  private async fetchOutlets() {
    let serviceParams = {
      route: RetailApiRoute.GetOutletsByProperty,
      uriParams: { PropertyId: Number(this._localization.GetPropertyInfo('PropertyId')) },
      header: '',
      body: undefined,
      showError: true,
      baseResponse: true
    };
    let response: any = await this._retailmanagementCommunication.getPromise(serviceParams);
    return this.mapSubpropertyToOutlet(response);
  }

  private mapSubpropertyToOutlet(subP): Outlet[] {
    let outlets = subP.map(s => {

      return <Outlet>{
        id: s.subPropertyId,
        isActive: s.isActive,
        outletNumber: s.subPropertyId,
        outletName: s.subPropertyName
      }
    });
    return outlets;
  }

  public getPaymentDevices() {
    let paymentDevices = [
      { id: '', description: '' },
      { id: 'rguestpay', description: this.captions.RGuestPay },
      { id: 'idtech', description: this.captions.Idtech }
    ];
    return paymentDevices;
  }

  sync() {
    // if (this.defaultUserConfig == undefined) {
      this.defaultUserConfig = JSON.parse(sessionStorage.getItem('userSessionConfigInfo'));
    // }   
    if (this.outlets == undefined) {
      this.outlets = JSON.parse(sessionStorage.getItem('outlets'));
    }

  }
  GetDefaultOutlet() {
    this.sync();
    const configuredOutlet = this.outlets && this.outlets.find(x => this.defaultUserConfig && x.id == this.defaultUserConfig.defaultOutletId);
    const description = configuredOutlet && configuredOutlet.outletName;
    let outletId = this.defaultUserConfig && this.defaultUserConfig.defaultOutletId;
    return { id: (outletId == 0) ? null : outletId, type: description };
  }

  GetDefaultPaymentDevice() {
    this.sync();
    return this.defaultUserConfig.defaultPaymentDevice;
  }
  GetDefaultDeviceName() {
    this.sync();
    return this.defaultUserConfig.defaultDeviceName;
  }

  SetDefaults(_defaults)
  {
    this.defaultUserConfig = _defaults;
    sessionStorage.setItem("userSessionConfigInfo", JSON.stringify(_defaults));
  }
}
