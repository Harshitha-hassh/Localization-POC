import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuickIdConfigBusiness } from './quickid-config.business';
import { ConfigData, QuickIdConfigSetting } from './quickid-config.model';
import { QuickIdConfigService } from './quickid-config.service';
import * as _ from 'lodash'
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

@Component({
  selector: 'app-quickid-config',
  templateUrl: './quickid-config.component.html',
  styleUrls: ['./quickid-config.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [QuickIdConfigBusiness, QuickIdConfigService]
})
export class QuickidConfigComponent implements OnInit {

  toggleGroup: FormGroup;
  captions: any;
  $destroyed: ReplaySubject<any> = new ReplaySubject(1);
  quickIdConfigOrginialData: ConfigData[];
  quickIdConfigFormValue: ConfigData[];
  enableSave: boolean;
  quickIdConfig = QuickIdConfigSetting;
  public dialog: MatDialog;
  constructor(
      private formBuilder: FormBuilder
    , private localization: RetailStandaloneLocalization
    , private quickidconfigBusiness:QuickIdConfigBusiness,
      ) {
    this.captions = this.localization.captions.utilities;
  }

  ngOnInit() {
    this.toggleGroup = this.formBuilder.group({
      retailtransactions: false
    });
    this.toggleGroup.valueChanges.pipe(takeUntil(this.$destroyed)).subscribe(x => {
      if (this.toggleGroup.dirty)
        this.enableSave = this.toggleGroup.valid ? true : false;
    });
    this.initialLoad();
  }

  async initialLoad() {
    const quickIdConfigValues:ConfigData[] = await this.quickidconfigBusiness.GetQuickIdConfiguration();
    this.quickIdConfigOrginialData = _.cloneDeep(quickIdConfigValues);
    this.quickIdConfigFormValue = _.cloneDeep(quickIdConfigValues);
    this.patchInitialValues(quickIdConfigValues);
    this.enableSave  = false;
    const QuickConfigSetting:any = await this.quickidconfigBusiness.GetSettingByModule();
    sessionStorage.setItem('QuickIdConfig',JSON.stringify(QuickConfigSetting[0]));
  }

  patchInitialValues(values: ConfigData[])
  {
    this.toggleGroup.patchValue(this.getPatchValue(values));
  }

  toggleChange(event,action) {
    if(action == QuickIdConfigSetting.retailtransactions) {
      this.toggleGroup.patchValue({
        retailtransactions:event[0]
      });
      this.quickIdConfigFormValue.find(x=>x.switch === QuickIdConfigSetting.retailtransactions).value = event[0];
    }
  }

  async OnSave() {
    this.quickidconfigBusiness.UpdateQuickIdConfigSettings(this.quickIdConfigFormValue.map(x => {
      return {
        id: x.id,
        moduleId: x.moduleId,
        switch: x.switch,
        value: x.value
      } as ConfigData
    })).then(res=>{
      this.initialLoad();
      this.enableSave = false;
    });   
  }

  OnCancel() {
    this.patchInitialValues(this.quickIdConfigOrginialData);
  }

  ngOnDestroy(): void {
    if(this.$destroyed) {
      this.$destroyed.next(true);
      this.$destroyed.complete();
    }
  }

  getPatchValue(configData: ConfigData[]){    
      return {
        retailtransactions: configData.find(x => x.switch === QuickIdConfigSetting.retailtransactions).value
      }
  }
}
