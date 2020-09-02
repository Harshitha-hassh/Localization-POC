import * as EnUs from "../../../assets/i18n/en-US.json";
import * as DefaultErrors from '../../../assets/errors/error.en-US.json';
import { Injectable } from "@angular/core";
import * as moment from "moment";
import * as _ from "lodash";
import { LocalizedMonthsModel, localizationJSON, Calendar, DaysModel } from 'src/app/shared/shared-models';
import { Localization  as CommonLocalization} from 'src/app/common/localization/localization';
import { JSONReaderService } from 'src/app/common/shared/services/load-json.service';

declare var $: any;
const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";
const DEFAULT_DECIMAL_SEP = ".";
const DEFAULT_THOUSAND_SEP = ",";
const DEFAULT_DATE_FORMAT = "l";
const DEFAULT_DATETIME_FORMAT = "l";
const DEFAULT_CURRENCY_LENGTH = 15;//Total Length With Decimal separator
type hourFormat = '24' | '12';

export const enum DateTimeFormat {
  HHmmss = 1,
  HHmm
}

export const enum JsonDataSourceType {
  ContactType
}
//export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Injectable(
  {
    providedIn: 'root'
  }
)
export class RetailStandaloneLocalization extends CommonLocalization{

  constructor(public jsonReader: JSONReaderService) {
    super(jsonReader);
  }
      /**
   * Display number in Million or Thousand format.
   * @param number value.
   */
  DisplayMillion(value: number,args: number): string {
    //Localization pending
    var exp, suffixes = ['K', 'M', 'B', 'T', 'Q'];
    if (value < 1000) {
      return value.toString();
    }
    exp = Math.floor(Math.log(value) / Math.log(1000));
    return (value / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1];   
  }

}
