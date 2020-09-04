import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'converobj'
})
export class ConvertObjPipe implements PipeTransform {

  transform(value: any, e: any): boolean {
    let returnArray;
    if (e.groupName === 'Clients') {
      let clientArray: Array<any> = [];
      let finalArray = [];
      e["clientDetails"].forEach(k => {
        if (k.appointmentDetails && k.appointmentDetails.length > 0) {
          k.appointmentDetails.forEach(element => {
            element['guestProfileId'] = k.guestProfileId;
            element['name'] = k.name;
            element['contactDetail'] = k.contactDetail;
            element['address'] = k.address;
            element['thumbNail'] = k.thumbNail;
            element['clientId'] = k.clientId;
            element['loyaltyDetail'] = k.loyaltyDetail;
            clientArray.push(element);
          });
        }
        else {
          clientArray.push(k);
        }
      });
      returnArray = clientArray;
    } else {
      returnArray = e[Object.keys(e)[1]];
    }
    return returnArray;
  }
}
