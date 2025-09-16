import { Injectable } from '@angular/core';
import { Imagedata } from '../../shared-models';
import { ImageCommunication } from '../../communication/services/image.service';



@Injectable({
    providedIn: 'root'
  })
export class ImageDataService {
    constructor(
        private _gatewayCommunication: ImageCommunication
    ) { }


    public async saveImage(imageData: Imagedata[]): Promise<string> {
        return this._gatewayCommunication.postPromise({
            route: RetailApiRoute.saveImage,
            body: imageData
        });
    }

    public async updateImage(imageData: Imagedata[]): Promise<number> {
        return this._gatewayCommunication.putPromise({
            route: RetailApiRoute.updateImage,
            body: imageData
        });
    }

    public async DeleteImageByReference(referenceid: string) {
        return this._gatewayCommunication.deletePromise({
            route: RetailApiRoute.DeleteImageByReference,
            uriParams: { guid: referenceid }

        });
    }

    public async GetImagesByReferenceId(imageReferenceId: string, isThumbnailOnly: boolean): Promise<Imagedata> {
     
        return await this._gatewayCommunication.getPromise({
            route: RetailApiRoute.GetImagesByReferenceId,
            uriParams: { imageReferenceId: imageReferenceId, isThumbnailOnly: isThumbnailOnly }
        });
    }

    public async GetAllImagesByReference(imageReferenceids: any, isthumbnailonly: boolean): Promise<Imagedata[]> {
        return this._gatewayCommunication.putPromise({
            route: RetailApiRoute.GetAllImagesByReferenceId,
            body: imageReferenceids,
            uriParams: { isThumbnailOnly: isthumbnailonly }
        });
    }

    public async GetImagebyPlatformGuestId(platformGuestId: string, tenantId: string, imageReferenceId: string): Promise<Imagedata> {
        return await this._gatewayCommunication.getPromise({
            route: RetailApiRoute.GetImagebyPlatformGuestId,
            uriParams: { platformGuestId: platformGuestId, tenantId: tenantId, imageReferenceId: imageReferenceId }
        });
    }

    public async SaveImageToPlatform(tenantId: string, platformGuestId: string, imageData: Imagedata[]): Promise<string> {
        return this._gatewayCommunication.postPromise({
            route: RetailApiRoute.SaveImageToPlatform,
            body: imageData,
            uriParams: { tenantId: tenantId, platformGuestId: platformGuestId }
        });
    }

    public async UpdateImageToPlatform(tenantId: string, platformGuestId: string, imageData: Imagedata[]): Promise<number> {
        return this._gatewayCommunication.putPromise({
            route: RetailApiRoute.UpdateImageToPlatform,
            body: imageData,
            uriParams: { tenantId: tenantId, platformGuestId: platformGuestId }
        });
    }

    public async DeleteImageFromPlatform(tenantId: string, platformGuestId: string, imageData: Imagedata[]): Promise<number> {
        return this._gatewayCommunication.deletePromise({
            route: RetailApiRoute.DeleteImageFromPlatform,
            body: imageData,
            uriParams: { tenantId: tenantId, platformGuestId: platformGuestId }
        });
    }
}
