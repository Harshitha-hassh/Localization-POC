import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageData} from '../../shared-models';
import * as _ from 'lodash';

@Component({
  selector: 'app-img-thumbnail',
  templateUrl: './img-thumbnail.component.html',
  styleUrls: ['./img-thumbnail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImgThumbnailComponent implements OnInit {

  @Input() imageContent: ImageData;
  @Input() thumbnail: boolean;
  @Input() imageType: string;
  url: any;
  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  ngOnChanges() {

    if (this.imageContent && !_.isEmpty(this.imageContent) && this.imageContent.contentType) {
      // Image thumbail component will only use thumbnail data to show the images.
      // so the below line is changed to use thumbnail
      // let imageUrl = `data:${this.imageContent.contentType};base64,${this.thumbnail ? this.imageContent.thumbnailData : this.imageContent.data}`;
      let imageUrl = `data:${this.imageContent.contentType};base64,${this.imageContent.thumbnailData}`;
      this.url = this.domSanitizer.bypassSecurityTrustUrl(imageUrl);
    } else {
      if (this.imageType === 'therapist') {
        this.url = 'assets/images/therapist.png';
      } else if (this.imageType === 'client') {
        this.url = 'assets/images/client.png';
      } else if (this.imageType === 'user') {
        this.url = 'assets/images/user.png';
      } else if (this.imageType === 'retailItem') {
        this.url = 'assets/images/shop/emptyshop.jpg';
      } else if (this.imageType === 'giftcard') {
        this.url = 'assets/images/shop/emptyshop.jpg';
      }
    }
  }

}
