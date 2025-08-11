import { Component, OnInit } from '@angular/core';
import { CommonVariablesService } from '../retail/shared/service/common-variables.service';
import { RetailUtilities } from '../retail/shared/utilities/retail-utilities';
import { RetailPropertyInformation } from '../core/services/retail-property-information.service';
import { AlertType } from '../retail/shared/shared.modal';
import { RetailLocalization } from '../retail/common/localization/retail-localization';
import * as GlobalConst from '../retail/shared/globalsContant';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private localization: RetailLocalization, public _CommonVariablesService: CommonVariablesService, 
    public _RetailUtilities: RetailUtilities, public _RetailPropertyInformation: RetailPropertyInformation
  ) { }

  ngOnInit() {
    this.checkDateAndShowInfo();
  }

    async checkDateAndShowInfo() {
    const property = await this._CommonVariablesService.GetPropertySettings();
    const isSystemDateEqual = this._RetailUtilities.ValidateDatesAreEqual(this._RetailUtilities.getDate(property.propertyDate), this._RetailPropertyInformation.CurrentDate);
    if (!isSystemDateEqual) {
      this._RetailUtilities.showAlert(this.localization.getError(-4702), AlertType.Warning, GlobalConst.ButtonType.Ok, (res) => {
        console.log('Date mismatch notification shown');
      });
    }
  }
}
