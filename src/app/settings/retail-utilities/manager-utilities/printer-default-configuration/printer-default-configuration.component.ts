import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Localization } from 'src/app/common/localization/localization';
import { AlertType } from 'src/app/shared/shared-models';
import { PrinterDefaultConfigurationBusiness } from './printer-default-configuration.business';
import { API, Options, UI } from "src/app/common/Models/printer-default-configuration.model";
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
@Component({
  selector: 'app-printer-default-configuration',
  templateUrl: './printer-default-configuration.component.html',
  styleUrls: ['./printer-default-configuration.component.scss'],
  providers: [PrinterDefaultConfigurationBusiness],
  encapsulation: ViewEncapsulation.None
})
export class PrinterDefaultConfigurationComponent implements OnInit {
  captions: any;
  commonCaptions: any;
  data: UI.MachinePrinterConfiguration[] = [];
  masterData: UI.MachinePrinterConfiguration[] = [];
  viewOnly: boolean = false;
  selectedValue = 0;
  printerDropdownOptions: Options[];
  defalutNoOfCopies : number;
  constructor(private fb: FormBuilder, private localization: Localization,
    private business: PrinterDefaultConfigurationBusiness, private utilities: RetailUtilities) {
    this.captions = this.localization.captions.settings.utilities;
    this.commonCaptions = this.localization.captions.common;
    this.defalutNoOfCopies=this.business.defalutNoOfCopies;
  }

  ngOnInit(): void {
    this.validateUserAccess();
    this.intializeData();
  }
  async intializeData() {
    //this.utilities.ToggleLoader(true);
    let printerManagerURI  = sessionStorage.getItem('PrinterManagerURI');
    if(printerManagerURI && printerManagerURI!='')
    this.printerDropdownOptions = await this.business.getPrinterOptions(printerManagerURI);
    else
    this.utilities.showCommonAlert(this.commonCaptions.MissingPrinterManagerURIConfig,AlertType.Error);
    this.masterData = await this.business.getData();
    this.data = this.mapMasterDatatoTemp(this.masterData);
    //this.utilities.ToggleLoader(false);
  }


  Onsave(data) {
    let apiModel: API.MachinePrinterConfiguration[] = this.business.APIMapper(data);
    this.business.CreateMachinePrinterConfiguration(apiModel).then(res => {
      if (res) {
        let machineId = this.localization.GetMachineId();
        this.setMachinePropertyConfig(apiModel.filter(p => p.machineId == machineId));
        this.utilities.showAlert(this.commonCaptions.configSaveSuccessFrom, AlertType.Success);
        this.intializeData();
      }
      else {
        this.utilities.showAlert(this.commonCaptions.Error, AlertType.Error);
        this.data = this.mapMasterDatatoTemp(this.masterData);
      }
    })


  }
  private async validateUserAccess() {
    await this.business.validateBreakPoints();
    this.disableControls();
  }

  private disableControls() {
    if (this.business.isViewOnly) {
      this.viewOnly = this.business.isViewOnly;
    }
  }
  Oncancel(eve) {
    this.data = this.mapMasterDatatoTemp(this.masterData);
  }

  setMachinePropertyConfig(config: API.MachinePrinterConfiguration[]) {
    this.utilities.setSession("MachinePrinterConfig", JSON.stringify(config));
  }
  mapMasterDatatoTemp(masterdata: UI.MachinePrinterConfiguration[]) {
    let tempData : UI.MachinePrinterConfiguration[] = []; 
    masterdata.forEach(val => {
      tempData.push({
        machineId: val.machineId,
        machineName: val.machineName,
        printerArr: val.printerArr.map(p => {
          let printerarr: UI.PrintInfoType;
          printerarr = {
            id: p.id,
            printerName: p.printerName,
            printInformationType: p.printInformationType,
            label: p.label,
            selectedValue: p.selectedValue,
            defaultNoofCopies : p.defaultNoofCopies
          };
          return printerarr;
        })
      })
    }
    );
    return [...tempData];
  }
}
