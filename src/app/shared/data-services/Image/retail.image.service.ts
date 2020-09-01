import { Injectable } from '@angular/core';
import { Localization } from 'src/app/core/localization/Localization';
import { Imagedata } from 'src/app/shared/shared-models';
import { ImageDataService } from './Image.data.services';
import { ImgRefType } from 'src/app/retail/shared/globalsContant';

@Injectable({
  providedIn: 'root'
})
export class RetailImageService {

  isEdit: boolean;
  url: any;
  editImageId: any;
  sequenceNo: any;

  ImageUploaded: boolean = false;
  base64textString: any;
  selectedFile: File;
  thumbnailImg: any;
  oldMargin: any;

  constructor(public localization: Localization,
    private imgService: ImageDataService) {
  }


  async updateItemImage(clientId: string, imageID, imgRefId: string, isImageRemoved, base64textString, thumbnailImg) {
    debugger;
    if (base64textString || isImageRemoved) {
      const base64result = isImageRemoved ? ['', ''] : base64textString.split(',');
      const base64Thumbnail = isImageRemoved ? ['', ''] : thumbnailImg.split(',');
      const imageDataObj: Imagedata = {
        referenceId: 0,
        referenceType: ImgRefType.client,
        data: base64result[1],
        id: imageID ? imageID : 0,
        thumbnailData: base64Thumbnail[1],
        contentType: base64result[0],
        sequenceNo: this.sequenceNo,
        imageReferenceId: clientId
      };
      await this.imgService.updateImage([imageDataObj]);
    }
  }

  async saveImage(clientId: string, base64textString, thumbnailImg): Promise<string> {
    debugger;
    if (base64textString) {
      const base64result = base64textString.split(',');
      const base64Thumbnail = thumbnailImg.split(',');
      const imageDataObj: Imagedata = {
        referenceId: 0,
        referenceType: ImgRefType.client,
        data: base64result[1],
        id: 0,
        thumbnailData: base64Thumbnail[1],
        contentType: base64result[0],
        sequenceNo: 0,
        imageReferenceId: clientId
      };
      return await this.imgService.saveImage([imageDataObj]);
    }
  }
  async getImageForClient(imgRefId: string, isthumbnailonly: boolean): Promise<Imagedata> {
    return await this.imgService.GetImagesByReferenceId(imgRefId, isthumbnailonly);

  }
  async getImagesForClients(imgRefIds: string[], isthumbnailonly: boolean): Promise<Imagedata[]> {
    return await this.imgService.GetAllImagesByReference(imgRefIds, isthumbnailonly);
  }

  //Get List of Profile Images
  async getProfileImages(profileList, imageReferenceId) {
    let playerList = profileList.map(p => p[imageReferenceId]);
    playerList = playerList.filter(x => x && x != '00000000-0000-0000-0000-000000000000')
    let imageList = playerList.length > 0 ? await this.getImagesForClients(playerList, true) : [];
    this.mapProfileImages(profileList, imageList, imageReferenceId);

  }

  // Map Profile Images to the respective Profiles
  mapProfileImages(profileList, imageList, imageReferenceId) {
    if (profileList && profileList.length > 0) {
      profileList.forEach(element => {
        element.profileImage = imageList ? imageList.find((image) => image.imageReferenceId.toLowerCase() == element[imageReferenceId].toLowerCase()) : '';
      });
    }
  }

}