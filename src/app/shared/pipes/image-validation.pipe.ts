import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'imagevalidation'
})
export class ImageValiation implements PipeTransform {

  transform(value: any, e: any): boolean {
    let returnImageUrl;
    if (e) {
        returnImageUrl = 'data:image/jpg;base64,' + e
    } else {
        returnImageUrl = './assets/images/client.png'
    }
    return returnImageUrl;
  }
}
