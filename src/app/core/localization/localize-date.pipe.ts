import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { Localization } from 'src/app/common/localization/localization';

@Pipe({
  standalone: false,
  name: 'localizeDate'
})
export class LocalizeDatePipe implements PipeTransform {
  constructor(private localization: Localization){}
  transform(value: any): any {
    //return moment(value).format('L');
    return moment(value).format(this.localization.inputDateFormat);
  }

}
