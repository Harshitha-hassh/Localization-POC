import { NativeDateAdapter } from '@angular/material/core';
import { RetailStandaloneLocalization } from './retailStandalone-localization';
import { PropertyInformation } from '../services/property-information.service';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import moment from 'moment';
import { Platform } from '@angular/cdk/platform';

const dateFormat = 'DD MMM YYYY';
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
    super(localization.localeCode);
  }
  format(date: Date, displayFormat: any): string {
    let data = moment;
    if (displayFormat === 'input') {
      return moment(date).format(this.localization.inputDateFormat);
    } else {
      return moment(date).format(this.localization.inputDateFormat);
    }
  }
  getFirstDayOfWeek(): number {
    return this.localization.getFirstDayOfWeek();
  }
  // parse(value: any): Date {
  //   return this.PropertyInfo.CurrentDate;
  // }
  parse(value: any): Date | null {
    if(value){
      if (!value.match(/[0-9-/.]/)) {
        return null;
      } else {
        const date = moment(value, this.localization.inputDateFormat);
        return date? date.toDate(): null;
      }
     
    }
      return null;
    }
  }
