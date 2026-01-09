import { PipeTransform, Pipe } from "@angular/core";
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

@Pipe({
  standalone: false,
    name: 'formatText',
    pure: true
})
export class FormatTextPipe implements PipeTransform {
    constructor(public localization: RetailStandaloneLocalization){
    }
    transform(value: any, format:string) {
        if (!value || value == "") {
            return "";
        }else if(!format||format==""){
            return value;
        }
        if (format == this.localization.captions.common.PhoneFormat) {
            let userInput = value.toString();
            let formattedNumber;
            formattedNumber = this.formatPhoneNumber(format, userInput);
            return formattedNumber;
        }
        else {
            let userInput = value.toString().split(':');
            let formattedNumber;
            // formattedNumber = this.formatPhoneNumber(format, userInput[1]);
            formattedNumber = this.formatPhoneNumber(this.localization.captions.common.PhoneFormat, userInput[1]);
            formattedNumber = formattedNumber.concat(this.localization.captions.common.Extension);
            formattedNumber = formattedNumber.concat(userInput[0]);
            return formattedNumber;
        }
    }

    formatPhoneNumber(format, userInput) {
        let returnVal: string = "";
        let indexOfUserValue: number = 0;
        for (let i = 0; i < format.length; i++) {
            const char = format[i];
            let charCode = char.toString().charCodeAt(0);
            const IsNumber: boolean = ((charCode >= 48) && (charCode <= 57));
            if (!IsNumber) {
                returnVal = returnVal + format[i];
            } else {
                if (userInput[indexOfUserValue]) {
                  returnVal = returnVal + userInput[indexOfUserValue];
                  if (userInput[indexOfUserValue + 1]) {
                    indexOfUserValue++;
                  } else {
                    break;
                  }
                } else {
                    break;
                }
            }
        }
        return returnVal;
    }
}
