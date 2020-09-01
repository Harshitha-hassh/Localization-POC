import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'localizeDate'
})
export class LocalizeDatePipe implements PipeTransform {

  transform(value: any): any {
    //return moment(value).format('L');
    return moment(value).format('DD MMM YYYY');
  }

}
