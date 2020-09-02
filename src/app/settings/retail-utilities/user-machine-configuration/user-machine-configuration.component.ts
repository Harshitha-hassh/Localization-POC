import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { SubscriptionLike as ISubscription } from 'rxjs';
import * as myGlobals from 'src/app/common/shared/shared/globalsContant'; // CONSTANT FILE ADD ANY CONSTANT VALUE
import { SubPropertyModel, ZebraPrinters } from '../../../retail/retail.modals';
import { NextId } from '../../../retail/retail.modals';
import { HttpResponseStatus } from '../../../retail/shared/service/payment/payment-business.model';
import { ZebraPrintService } from '../../../retail/retail-print/zebra-print.service';
import { PropertyInformation } from '../../../core/services/property-information.service';
import { StoreTerminal } from 'src/app/retail/shared/business/shared.modals';
import { PayAgentService } from 'src/app/common/shared/shared/service/payagent.service';
import { PaymentMethods, HandleRequest, HandleResponse } from 'src/app/common/shared/shared/business/shared.modals';
import { OperationType } from 'src/app/common/shared/shared/globalsContant';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { UserMachineConfigurationService } from 'src/app/retail/common/services/user-machine-configuration.service';
import { UserSessionConfiguration } from 'src/app/common/shared/core.model';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';

@Component({
  selector: 'app-user-machine-configuration',
  templateUrl: './user-machine-configuration.component.html',
  styleUrls: ['./user-machine-configuration.component.scss'],
  providers: [PayAgentService],
  encapsulation: ViewEncapsulation.None
})
export class UserMachineConfigurationComponent implements OnInit , OnDestroy {

  userSessionConfigForm: FormGroup;
  userSessionConfiguration = new UserSessionConfiguration();

  captions: any = this.localization.captions.utilities;
  outlets: Array<any>;
  outletTerminals: StoreTerminal[] = [{ terminalId: '', terminalName: '' } as StoreTerminal];
  courses: Array<any>;
  paymentDevices: Array<any>;
  deviceNames: Array<any>;
  printers: Array<any>;
  selectedOutlet: number;
  selectedCourse: number;
  selectedDeviceName: string;
  selectedPaymentDevice: string;
  isIdtechSred = false;
  ZebraPrinters: ZebraPrinters;
  smallStickersPrinter: string;
  hangingTicketsPrinter: string;

  enableSave: boolean;
  enablePaymentDeviceSelect = false;
  enablePrinterSelect = false;
  userMachineConfigSubscription: ISubscription;
  IsViewOnly: boolean;
  userOperationType: myGlobals.OperationType = OperationType.None;
  useRetailInterface: boolean;
  testMode = false;
  showPaymentDevice: boolean;

  constructor(
    private fb: FormBuilder,
    public localization: RetailStandaloneLocalization,
    public PropertyInfo: PropertyInformation,
    private userMachineConfigurationService: UserMachineConfigurationService,
    private http: HttpServiceCall,
    private utils: RetailUtilities, private payAgentService: PayAgentService,
    private zebra: ZebraPrintService) {

  }

  async ngOnInit() {
    this.userSessionConfigForm = this.fb.group({
      defaultOutletId: '',
      defaultTerminalId: 0,
      defaultCourseId: '',
      defaultPaymentDevice: '',
      defaultDeviceName: '',
      isIdtechSred: false,
      smallStickersPrinter: '',
      hangingTicketsPrinter: ''
    });
    this.useRetailInterface = this.PropertyInfo.UseRetailInterface;
    this.userMachineConfigSubscription = this.userSessionConfigForm.valueChanges.subscribe(() => {
      if (this.userSessionConfigForm.dirty) {
        this.enableSave = true;
      }
    });

    await this.onPageLoad();
  }

  async onPageLoad() {
    this.getUserSessionConfiguration(this.localization.GetPropertyInfo('UserId'))
      .catch(err => console.error(err));

    this.GetPropertyOutletsAsync()
      .catch(err => console.error(err));
    // Commented until ready for use with Golf
    // this.getCoursesAsync()
    //   .catch(err => console.error(err));
    if (!this.useRetailInterface) {
      this.getDeviceNamesAsync();
      this.GetPaymentDevicesAsync();
      this.getPrinterNamesAsync();
    }
    // .catch(err => console.error(err));
    // .catch(err => console.error(err));
    // .catch(err => console.error(err));

  }

  // User Session Configuration
  private async getUserSessionConfiguration(userId) {
    const userSessionConfiguration: UserSessionConfiguration = 
    await this.userMachineConfigurationService.getUserSessionConfiguration(userId);
    if (userSessionConfiguration.defaultOutletId) {
      await this.GetStoreTerminals(userSessionConfiguration.defaultOutletId);
    }
    if (userSessionConfiguration.id === 0) {
      this.userOperationType = OperationType.Create;
    } else {
      this.userOperationType = OperationType.Edit;
    }
    this.displayUserSessionConfiguration(userSessionConfiguration);
  }

  displayUserSessionConfiguration(userSessionConfiguration: UserSessionConfiguration) {
    if (this.userSessionConfigForm) {
      this.userSessionConfigForm.reset();
    }
    this.userSessionConfiguration = userSessionConfiguration;

    // Update the data on the form
    this.userSessionConfigForm.patchValue({
      defaultOutletId: this.userSessionConfiguration.defaultOutletId,
      defaultTerminalId: this.userSessionConfiguration.defaultTerminalId,
      defaultCourseId: this.userSessionConfiguration.defaultCourseId,
      defaultPaymentDevice: this.userSessionConfiguration.defaultPaymentDevice,
      defaultDeviceName: this.userSessionConfiguration.defaultDeviceName,
      isIdtechSred: this.userSessionConfiguration.isIdtechSred,
      smallStickersPrinter: this.userSessionConfiguration.smallStickersPrinter,
      hangingTicketsPrinter: this.userSessionConfiguration.hangingTicketsPrinter
    });

  }

  private async createUserSessionConfiguration(body: UserSessionConfiguration): Promise<NextId> {
    const result = await this.userMachineConfigurationService.createUserSessionConfiguration(body);
    return result;
  }

  private async updateUserSessionConfiguration(body: UserSessionConfiguration): Promise<UserSessionConfiguration> {
    const result = await this.userMachineConfigurationService.updateUserSessionConfiguration(body);
    return result;
  }

  // Outlets
  private async GetPropertyOutletsAsync() {
    await this.GetOutletsByPropertyId();
  }

  async GetOutletsByPropertyId() {
    const result = await this.http.CallApiAsync<SubPropertyModel[]>({
      host: myGlobals.Host.retailManagement,
      callDesc: 'GetOutletsByPropertyAndProduct',
      method: HttpMethod.Get,
      uriParams: { propertyId: Number(this.localization.GetPropertyInfo('PropertyId')),
       productId: Number(this.localization.GetPropertyInfo('ProductId')) }
    });
    let outlets: SubPropertyModel[] = result.result ? result.result : [];
    // console.dir(outlets);
    outlets = outlets.filter(x => x.isActive);
    this.outlets = outlets.map(x => { return { id: x.subPropertyID, description: x.subPropertyName }; });
    this.outlets.unshift({ id: 0, description: '' });
  }

  async GetStoreTerminals(selectedOutletId: number) {
    this.outletTerminals = [];
    if (selectedOutletId) {
      const terminals = await this.http.CallApiAsync<StoreTerminal[]>({
        host: myGlobals.Host.retailManagement,
        callDesc: 'GetStoreTerminal',
        method: HttpMethod.Get,
        uriParams: { outletId: selectedOutletId }
      });
      this.outletTerminals = terminals.result && terminals.result.length > 0 ? terminals.result : [];
      this.outletTerminals.map(o => o.terminalId = Number(o.terminalId));
      this.outletTerminals.unshift({ terminalId: 0, terminalName: '' } as StoreTerminal);
    }
  }

  async outletChange(arg) {
    this.userSessionConfigForm.controls['defaultTerminalId'].setValue(0);
    if (this.PropertyInfo.UseRetailInterface) {
      await this.GetStoreTerminals(arg.value);
    }
  }

  // Courses
  private async getCoursesAsync() {
    await this.getCourses();
  }

  // Test method for use until Golf is ready
  async getCourses(): Promise<any> {
    return new Promise((resolve, reject) => {
      const courses = [
        { id: 0, description: '' },
        { id: 1, description: 'course A' },
        { id: 2, description: 'course B' },
        { id: 3, description: 'course C' }];
      if (courses) {
        resolve(this.courses = courses);
      } else {
        reject('error');
      }
    });
  }

  // Payment Devices
  private async GetPaymentDevicesAsync() {
    await this.getPaymentDevices();
  }

  async getPaymentDevices(): Promise<any> {
    return new Promise((resolve, reject) => {
      const paymentDevices = [
        { id: '', description: '' },
        { id: 'rguestpay', description: this.localization.captions.utilities.RGuestPay },
        { id: 'idtech', description: this.localization.captions.utilities.Idtech }];
      if (paymentDevices) {
        resolve(this.paymentDevices = paymentDevices);
      } else {
        reject('error');
      }
    });
  }

  // Device Names
  private async getDeviceNamesAsync(): Promise<void> {
    await this.GetHandles();
  }

  private async GetHandles() {
    const body: HandleRequest = {
      tenderId: PaymentMethods.CreditCard.toString()
    };
    const handleResponse: Promise<HandleResponse> = this.payAgentService.GetHandlesWithTimeout(body);

    handleResponse.then(response => {
      if (response.status.toLocaleLowerCase() == HttpResponseStatus.Success) {
        this.deviceNames = response.paymentHandle.map(x => x.name);
        // console.dir(this.deviceNames);
        this.deviceNames = this.deviceNames.map(x => { return { id: x, description: x }; });
        this.deviceNames.unshift({ id: '', description: '' });
        this.enablePaymentDeviceSelect = true;
      } else {
        this.deviceNames = [];
        this.utils.ShowError(this.localization.captions.common.Error, this.localization.captions.shop.NoPaymentDevicesFound);
        this.enablePaymentDeviceSelect = false;
        if (this.testMode == true) {
          this.getDeviceNames(); // call test method
          this.enablePaymentDeviceSelect = true;
        }
      }
      this.deviceChanged({ value: this.userSessionConfiguration.defaultPaymentDevice });
    }).catch(error => {
      this.deviceNames = [];
      this.utils.ShowError(this.localization.captions.common.Error, this.localization.captions.shop.NoPaymentDevicesFound);
      this.enablePaymentDeviceSelect = false;
      if (this.testMode == true) {
        this.getDeviceNames(); // call test method
        this.enablePaymentDeviceSelect = true;
      }
      this.deviceChanged({ value: this.userSessionConfiguration.defaultPaymentDevice });
    });
  }

  // Test method for use when no Pay Agent available
  async getDeviceNames(): Promise<any> {
    return new Promise((resolve, reject) => {
      const deviceNames = [
        { id: '', description: '' },
        { id: 'device1', description: 'Device 1' },
        { id: 'device2', description: 'Device 2' },
        { id: 'device3', description: 'Device 3' }];
      if (deviceNames) {
        resolve(this.deviceNames = deviceNames);
      } else {
        reject('error');
      }
    });
  }

  // Printer Names
  private async getPrinterNamesAsync(): Promise<void> {
    this.printers = [];
    this.ZebraPrinters = await this.zebra.getLocalDevices().toPromise();
    if (this.ZebraPrinters !== undefined && this.ZebraPrinters.printer.length > 0) {
      for (var p of this.ZebraPrinters.printer) {
        // console.dir(p);
        let description: string = p.name;
        if (p.name.substring(0, 3).toLowerCase() == '18j') {
          description = `Zebra ZT410: ${p.name}`;
        }
        if (p.name.substring(0, 3).toLowerCase() == '28j') {
          description = `Zebra GK420: ${p.name}`;
        }
        this.printers.push(
          {
            id: p.name,
            description: description
          }
        );
      }
      this.printers.unshift({ id: '', description: '' });
      console.dir(this.printers);
      this.enablePrinterSelect = true;

    } else {
      this.enablePrinterSelect = false;
      this.utils.ShowError(this.localization.captions.common.Error, this.localization.captions.utilities.NoPrintersFound);
      if (this.testMode == true) {
        await this.getPrinterNames(); // call test method
        this.enablePrinterSelect = true;
      }
    }
  }

  // Test method to use when no Zebra printers connected
  async getPrinterNames(): Promise<any> {
    return new Promise((resolve, reject) => {
      const printers = [
        { id: '', description: '' },
        { id: 'printer1', description: 'Printer 1' },
        { id: 'printer2', description: 'Printer 2' }
      ];
      if (printers) {
        resolve(this.printers = printers);
      } else {
        reject('error');
      }
    });
  }

  async save() {
    let nextId: NextId;
    let result: UserSessionConfiguration;
    const body = { ...this.userSessionConfiguration, ...this.userSessionConfigForm.value };
    switch (this.userOperationType) {
      case OperationType.Create:
        nextId = await this.createUserSessionConfiguration(body);
        this.updatesessionStorage(body);
        break;
      case OperationType.Edit:
        result = await this.updateUserSessionConfiguration(body);
        this.updatesessionStorage(body);
        break;
      default:
    }
    this.afterSaveOrUpdate();
  }

  private updatesessionStorage(values: any): void {
    const userSessionConfigKey = 'userSessionConfigInfo';
    const userSessionConfigValues =
      ` Id=${values.id};
      UserId=${values.userId};
      DefaultOutletId=${values.defaultOutletId};
      DefaultTerminalId=${values.defaultTerminalId};
      DefaultCourseId=${values.defaultCourseId};
      DefaultPaymentDevice=${values.defaultPaymentDevice};
      DefaultDeviceName=${values.defaultDeviceName};
      IsIdtechSred=${values.isIdtechSred};
      HangingTicketsPrinter=${values.hangingTicketsPrinter};
      SmallStickersPrinter=${values.smallStickersPrinter};
`;
    sessionStorage.setItem(userSessionConfigKey, userSessionConfigValues);
  }

  afterSaveOrUpdate() {
    this.userOperationType = OperationType.Edit;
    this.enableSave = false;
  }

  cancel() {
    this.userSessionConfigForm.reset();
    this.getUserSessionConfiguration(this.localization.GetPropertyInfo('UserId'))
      .catch(err => console.error(err));
    this.enableSave = false;
  }

  ngOnDestroy() {
    if (this.userMachineConfigSubscription) {
      this.userMachineConfigSubscription.unsubscribe();
    }
  }

  deviceChanged(event) {
    if (event && event.value) {
      if (event.value === 'idtech') {
        this.userSessionConfigForm.controls.defaultDeviceName.setValue('');
        this.userSessionConfigForm.controls.isIdtechSred.setValue(false);
        this.showPaymentDevice = false;
      } else {
        this.showPaymentDevice = true;
      }
    }
  }
}
