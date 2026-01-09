import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuickIdConfigBusiness } from './quickid-config.business';
import { ConfigData, QuickIdConfigSetting } from './quickid-config.model';
import { QuickIdConfigService } from './quickid-config.service';
import * as _ from 'lodash'
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

@Component({
  standalone: false,
  selector: 'app-quickid-config',
  templateUrl: './quickid-config.component.html',
  styleUrls: ['./quickid-config.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [QuickIdConfigBusiness, QuickIdConfigService]
})
export class QuickidConfigComponent implements OnInit {

  toggleGroup: UntypedFormGroup;
  captions: any;
  $destroyed: ReplaySubject<any> = new ReplaySubject(1);
  quickIdConfigOrginialData: ConfigData[];
  quickIdConfigFormValue: ConfigData[];
  enableSave: boolean;
  viewOnly: boolean = false;
  quickIdConfig = QuickIdConfigSetting;
  public dialog: MatDialog;
  constructor(
    private formBuilder: UntypedFormBuilder
    , private localization: RetailStandaloneLocalization
    , private quickidconfigBusiness: QuickIdConfigBusiness,
  ) {
    this.captions = this.localization.captions.utilities;
  }

  ngOnInit() {
    this.validateUserAccess();
    this.toggleGroup = this.formBuilder.group({
      retailtransactions: false,
      discountUpdateRemove: false,
      priceOverride: false,
      couponRedemption: false
    });
    this.toggleGroup.valueChanges.pipe(takeUntil(this.$destroyed)).subscribe(x => {
      if (this.toggleGroup.dirty)
        this.enableSave = this.toggleGroup.valid ? true : false;
    });
    this.initialLoad();
  }
  private async validateUserAccess() {
    await this.quickidconfigBusiness.validateBreakPoints()
    this.disableControls();
  }
  private disableControls() {
    if (this.quickidconfigBusiness.isViewOnly) {
      this.viewOnly = this.quickidconfigBusiness.isViewOnly;
    }
  }

  async initialLoad() {
    const quickIdConfigValues: ConfigData[] = await this.quickidconfigBusiness.GetQuickIdConfiguration();
    this.quickIdConfigOrginialData = _.cloneDeep(quickIdConfigValues);
    this.quickIdConfigFormValue = _.cloneDeep(quickIdConfigValues);
    this.patchInitialValues(quickIdConfigValues);
    this.enableSave = false;
    const QuickConfigSetting: any = await this.quickidconfigBusiness.GetSettingByModule();
    sessionStorage.setItem('QuickIdConfig', JSON.stringify(QuickConfigSetting[0]));
  }

  patchInitialValues(values: ConfigData[]) {
    this.toggleGroup.patchValue(this.getPatchValue(values));
  }

  toggleChange(event, action) {
    if (action == QuickIdConfigSetting.retailtransactions) {
      this.toggleGroup.patchValue({
        retailtransactions: event[0]
      });
      this.quickIdConfigFormValue.find(x => x.switch === QuickIdConfigSetting.retailtransactions).value = event[0];
    }
    if (action == QuickIdConfigSetting.discountUpdateRemove) {
      this.toggleGroup.patchValue({
        discountUpdateRemove: event[0]
      });
      this.quickIdConfigFormValue.find(x => x.switch === QuickIdConfigSetting.discountUpdateRemove).value = event[0];
    }
    if (action == QuickIdConfigSetting.priceOverride) {
      this.toggleGroup.patchValue({
        priceOverride: event[0]
      });
      this.quickIdConfigFormValue.find(x => x.switch === QuickIdConfigSetting.priceOverride).value = event[0];
    }
    if (action == QuickIdConfigSetting.couponRedemption) {
      this.toggleGroup.patchValue({
        couponRedemption: event[0]
      });
      this.quickIdConfigFormValue.find(x => x.switch === QuickIdConfigSetting.couponRedemption).value = event[0];
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
    })).then(res => {
      this.initialLoad();
      this.enableSave = false;
    });
  }

  OnCancel() {
    this.patchInitialValues(this.quickIdConfigOrginialData);
  }

  ngOnDestroy(): void {
    if (this.$destroyed) {
      this.$destroyed.next(true);
      this.$destroyed.complete();
    }
  }

  getPatchValue(configData: ConfigData[]) {
    return {
      retailtransactions: configData.find(x => x.switch === QuickIdConfigSetting.retailtransactions).value,
      discountUpdateRemove: configData.find(x => x.switch === QuickIdConfigSetting.discountUpdateRemove).value,
      priceOverride:configData.find(x => x.switch === QuickIdConfigSetting.priceOverride).value,
      couponRedemption:configData.find(x => x.switch === QuickIdConfigSetting.couponRedemption).value
    }
  }
}
