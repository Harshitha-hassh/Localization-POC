import { Injectable } from '@angular/core';
import { RetailPosCommunication } from 'src/app/shared/communication/services/retailpos.service';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';
import { API } from 'src/app/common/components/combine-guest-records/combine-guest-ui-model';


@Injectable({
  providedIn: 'root'
})
export class CombineGuestDataService {

  constructor(private _http: RetailPosCommunication) { }

  getGuestsBySearchCriteria(guestSearchFields: API.GuestSearchFields): Promise<API.Guest[]> {  
    return this._http.postPromise<API.Guest[]>({route:RetailRoutes.GetGuestInformation,body:guestSearchFields },false);
  }
  
  
 MergeGuestsRecords(primaryGuest: string, secondaryGuest: string[]): Promise<boolean> {
    return this._http.putPromise<boolean>({route:RetailRoutes.CombineGuestInformation,uriParams: { primaryGuestId: primaryGuest },body:secondaryGuest },false);
  }

  GetClientDataByGuid(guestId: any):Promise<API.Guest>{
     return this._http.putPromise<API.Guest>({route:RetailRoutes.GetGuestInfoByGuid,uriParams: { id: guestId }});
      
    }

  UpdateGuestInformation(guestInfo: API.Guest):Promise<boolean>
  {
    return this._http.putPromise<boolean>({route:RetailRoutes.UpdateGuestInformation,body:guestInfo },false);
  }
}


export interface ContactPhoneType {
  id?: number;
  description?: string;
  type?: string;
}

export interface ContactEmailType {
  id?: number;
  description?: string;
  type?: string;
}