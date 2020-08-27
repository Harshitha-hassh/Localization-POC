import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Localization } from 'src/app/common/shared/localization/Localization';
import { ALLOWED_IMAGE_SIZE, COMPRESSION_LIMIT} from 'src/app/common/shared/shared/globalsContant';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {

  @Input() readOnly: boolean;
  @Input() emptyImgCaption: string;
  @Input('imgData')
  set ImageData(value) {
    if (value) {
      this.url = value;
      this.ImageUploaded = true;
    } else {
      this.ImageUploaded = false;
      this.url = '';
    }
  }
  @Output() fileDeleted = new EventEmitter();
  @Output() fileUploaded = new EventEmitter();
  @Output() fileSizeExceeded = new EventEmitter();
  url: any;
  ImageUploaded: boolean;
  captions: any;
  isViewOnly:boolean = false; // was not declared

  constructor(private imageCompress: NgxImageCompressService, public _ls:Localization) { }

  ngOnInit() {

    this.captions = this._ls.captions.common;
  }

  compressFile() {
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.url = image;
      // convert to MB
      const fileSize = this.imageCompress.byteCount(image) / (1024);
      console.log('Size in kilo bytes was:', fileSize);
      if (fileSize > COMPRESSION_LIMIT) {
        this.imageCompress.compressFile(image, orientation).then(
          result => {
            const compressedfileSize = this.imageCompress.byteCount(result) / (1024 * 1024);
            console.log('Size in Mega bytes was:', compressedfileSize);
            if (compressedfileSize <= ALLOWED_IMAGE_SIZE) {
              this.url = result;
              this.ImageUploaded = true;
              // this.fileUploaded.emit(result);
              this.compressThumbnail(result);
            } else {
              this.fileSizeExceeded.emit();
            }
          }
        );
      } else {
        this.ImageUploaded = true;
        this.compressThumbnail(image);
        // let imgData = {orgImg: image};
        // this.imageCompress.compressFile(image, orientation, 30, 30).then(result=>{
        //   const compressedfileSize = this.imageCompress.byteCount(result) / (1024);
        //   console.log('Size in Kilo bytes was:', compressedfileSize);
        //   imgData['tmbData'] = result
        //   this.fileUploaded.emit(imgData);
        // })
      }
    });
  }

  compressThumbnail(image){
    let imgData = {orgImg: image};
    this.imageCompress.compressFile(image, 1, 30, 30).then(result=>{
      const compressedfileSize = this.imageCompress.byteCount(result) / (1024);
      console.log('Size in Kilo bytes was:', compressedfileSize);
      imgData['tmbImg'] = result
      this.fileUploaded.emit(imgData);
    })
  }

  onFileDelete() {
    this.ImageUploaded = false;
    this.fileDeleted.emit();
  }
}
