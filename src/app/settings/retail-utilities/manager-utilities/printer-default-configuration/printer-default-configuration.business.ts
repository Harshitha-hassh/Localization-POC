import { Injectable } from '@angular/core';
import { API, Options, PrintInformationType, UI } from "src/app/common/Models/printer-default-configuration.model";
import { PrintManagerDataService } from 'src/app/common/dataservices/printmanager.data.services';
import { APIPrinterDetails, PropertyInformation } from 'src/app/common/Models/common.models';
import { Localization } from 'src/app/common/localization/localization';
import { MachineName } from 'src/app/common/shared/shared.modal';
import { MachinePrinterConfigDataService } from 'src/app/common/dataservices/machine-printer-configuration.data-services';
import { MachineNameDataService } from 'src/app/common/dataservices/machinename.data.service';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';
import { SettingScreen } from 'src/app/retail/shared/shared.modal';
import { UserAccessBreakPoints } from 'src/app/common/constants/useraccess.constants';
export enum PrintInformationTypeProduct {
  Recepit=0,
  // CartAgreement = 1,
  // ClubAgreement = 2 ,
  // ShoeAgreement = 3 ,
  RetailSaleChit = 4,
 // CaddyShack = 5,
  HangingTicket = 6 ,
  SmallSticker = 7
}
@Injectable()
export class PrinterDefaultConfigurationBusiness {
  captions: any;
  printerDropdownOptions: Options[];
  machineName: MachineName[] = [];
  PrintInfoTypes = PrintInformationType;
  isViewOnly: boolean = false;
  isAllow: boolean = false;
  defalutNoOfCopies : number = 1;
  /**
   * Class contains business logic and transformation between the UI and API model.
   * One or more data services can be injected to get the data for UI binding.
   */
  constructor(private _machinePrinterConfigDataService: MachinePrinterConfigDataService
    , private machineNameDataService: MachineNameDataService
    , private printManagerDataService: PrintManagerDataService
    , private localization: Localization
    , public _userAccessBusiness: UserAccessBusiness) {
    this.captions = this.localization.captions.utilities;
  }

  async getPrinterOptions(): Promise<Options[]> {
   // const setting: setting.GolfSetting = JSON.parse(sessionStorage.getItem(SettingScreen.GolfSetting));
   // let printerManagerURI = setting.printerManagerURI;
   let printerManagerURI = 'http://localhost:5100';
    let printers = await this.printManagerDataService.GetAllPrinters(printerManagerURI);
    this.printerDropdownOptions = printers.map(p => this.printDropdownMapper(p));
    return this.printerDropdownOptions;
  }
  printDropdownMapper(printer: APIPrinterDetails): Options {
    return {
      key: printer.name,
      label: printer.name,
      ischecked: false,
      value: printer.name
    }
  }
  async getData(): Promise<UI.MachinePrinterConfiguration[]> {
    await this.getMachineName();
    return this.getMachinePrinterConfigDataService();
  }


  async getMachineName(): Promise<MachineName[]> {
    let machine = await this.machineNameDataService.GetMachineNames(1);
    this.machineName = [...machine]
    return this.machineName;
  }
  async getMachinePrinterConfigDataService(): Promise<UI.MachinePrinterConfiguration[]> {
    let apiModel = await this._machinePrinterConfigDataService.getMachinePrinterConfiguration();
    return this.UIMapper(apiModel);
  }
  async CreateMachinePrinterConfiguration(apiModel: API.MachinePrinterConfiguration[]): Promise<Boolean> {

    return this._machinePrinterConfigDataService.CreateMachinePrinterConfiguration(apiModel);
  }
  UIMapper(apimodel: API.MachinePrinterConfiguration[]): UI.MachinePrinterConfiguration[] {
    let uiModel: UI.MachinePrinterConfiguration[] = [];
    this.machineName.forEach(mi => {
      let temp = apimodel.filter(p => p.machineId == mi.id);
      uiModel.push({
        machineId: mi.id,
        machineName: mi.name,
        printerArr: this.generatePrintInfoType(temp)
      })
    })
    return uiModel;
  }
  APIMapper(uiModel: UI.MachinePrinterConfiguration[]): API.MachinePrinterConfiguration[] {
    let apiModel: API.MachinePrinterConfiguration[] = [];
    uiModel.forEach(a => {
      a.printerArr.forEach(p => {
        apiModel.push({
          machineId: a.machineId,
          printInformationType: p.printInformationType,
          printerName: p.printerName,
          id: p.id,
          defaultNoofCopies:p.defaultNoofCopies
        })
      })
    })
    return apiModel;
  }
  generatePrintInfoType(apiModel: API.MachinePrinterConfiguration[]): UI.PrintInfoType[] {
    let printInfo: UI.PrintInfoType[] = [];  
      for (const [propertyKey, propertyValue] of Object.entries(PrintInformationTypeProduct)) {
        if (!Number.isNaN(Number(propertyKey))) {
          continue;
        }
        let printer : API.MachinePrinterConfiguration = apiModel.length !=0 ?  apiModel.find(pt=>Number(pt.printInformationType)==propertyValue) : null;
        printInfo.push(this.pushPrintInfo(Number(propertyValue), this.captions.PrinterDefaultConfiguration[propertyValue],printer));
      }    
    return printInfo;
  }

  pushPrintInfo(printInformationType:PrintInformationType, caption, p?: API.MachinePrinterConfiguration): UI.PrintInfoType {
    return {
      id: p ? p.id : 0,
      printInformationType: printInformationType,
      label: caption,
      printerName: p ? p.printerName : null,
      selectedValue: p ? this.printerDropdownOptions.find(o => o.key == p.printerName) : null,
      defaultNoofCopies:p ? p.defaultNoofCopies : this.defalutNoOfCopies
    }
  }
  async validateBreakPoints(): Promise<boolean> {
    // const result = await this._userAccessBusiness.getUserAccess(UserAccessBreakPoints.PRINTERDEFAULTCONFIGURATION, true);
    // this.isViewOnly = result.isViewOnly;
    // this.isAllow = result.isAllow;
    return false;// result.isAllow;
  }

}

