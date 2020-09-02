import { NativeDateAdapter } from '@angular/material';
import { RetailStandaloneLocalization } from './retailStandalone-localization';
import { PropertyInformation } from '../services/property-information.service';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Platform } from '@angular/cdk/platform';

const dateFormat = 'l';
const calenderDateFormat = 'MMM YYYY';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  constructor(
    public localization: RetailStandaloneLocalization,
    private PropertyInfo: PropertyInformation
  ) {
    super(localization.localeCode, new Platform());
  }
  format(date: Date, displayFormat: any): string {
    let data = moment;
    if (displayFormat === 'input') {
      return moment(date).format(dateFormat);
    } else {
      return moment(date).format(calenderDateFormat);
    }
  }
  getFirstDayOfWeek(): number {
    return this.localization.getFirstDayOfWeek();
  }
  parse(value: any): Date {
    return this.PropertyInfo.CurrentDate;
  }
}
