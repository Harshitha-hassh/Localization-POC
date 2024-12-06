import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AlertAction, AlertType, ButtonType } from 'src/app/shared/shared-models';
import { AgToggleConfig, ButtonValue } from 'src/app/common/Models/ag-models';
import { Subscription } from 'rxjs';
import { HomeDashboardConfigurationBusiness } from './home-dashboard-configuration.business';
import { Localization } from 'src/app/common/localization/localization';

@Component({
  selector: 'app-home-dashboard-configuration',
  templateUrl: './home-dashboard-configuration.component.html',
  // styleUrls: ['./home-dashboard-configuration.component.scss'],
  providers: [HomeDashboardConfigurationBusiness]
})

export class HomeDashboardConfigurationComponent implements OnInit {
  captions: any;
  dashboardViews: any[] = [];
  dashboardConfigurationForm: UntypedFormGroup;
  saveButton: ButtonValue;
  cancelButton: ButtonValue;
  formsubcriber: Subscription;
  constructor(private localization: Localization, private _fb: UntypedFormBuilder, private business: HomeDashboardConfigurationBusiness) {
    this.captions = this.localization.captions
  }
  ngOnInit() {

  }

  formGenerator() {

  }

  getCustomizedDashboard() {

  }

  onSave(eve) {

  }

  onCancel(eve) {

  }

  private disableActionButtons(isSaveBtnDisable: boolean = true, isCancelBtnDisable: boolean = true) {
    this.saveButton.disabledproperty = isSaveBtnDisable;
    this.cancelButton.disabledproperty = isCancelBtnDisable;
  }
}