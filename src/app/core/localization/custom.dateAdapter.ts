import { NativeDateAdapter } from '@angular/material/core';
import { RetailStandaloneLocalization } from './retailStandalone-localization';
import { PropertyInformation } from '../services/property-information.service';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import moment from 'moment';
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
    private PropertyInfo: PropertyInformation,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(localization.localeCode, new Platform(platformId));
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
