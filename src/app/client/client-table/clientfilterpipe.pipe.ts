import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'clientfilterpipe'
})
export class ClientfilterpipePipe implements PipeTransform {

  transform(inputArray: any[], Value: string, headerKey: any[]): any[] {
    if (!inputArray) return [];
    if (!Value) return inputArray;
    return inputArray.filter(result => {
      for (let key in result) {
        if(result[key] != undefined && result[key] != null) {
          if (typeof (result[key]) == 'string' && result[key].toLowerCase().includes(Value.toLowerCase())) {
            if (headerKey.indexOf(key) != -1) {
              return result[key].toLowerCase().includes(Value.toLowerCase());
            }
          }
          else if (typeof (result[key]) == 'number') {
            if (headerKey.indexOf(key) != -1) {
              let matchedValue = Number(result[key].toString().toLowerCase().includes(Value.toLowerCase()));
              if (matchedValue) {
                return matchedValue;
              }
            }
          }
          else if (typeof (result[key]) == 'object') {
            if (headerKey.indexOf(key) != -1) {
              let matchedValue = result[key].name.toLowerCase().includes(Value.toLowerCase()) || result[key].email.toLowerCase().includes(Value.toLowerCase());
              if (matchedValue) {
                return matchedValue;
              }
            }
          }
        }
        
      }
      return '';
    });
  }

}
