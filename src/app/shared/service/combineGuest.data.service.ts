import { Injectable } from '@angular/core';
import { RetailPosCommunication } from 'src/app/shared/communication/services/retailpos.service';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';
import { API } from 'src/app/common/components/combine-guest-records/combine-guest-ui-model';
import { HttpMethod,  HttpServiceCall } from 'src/app/common/shared/shared/service/http-call.service';
import { Host } from 'src/app/common/shared/shared/globalsContant';


@Injectable({
  providedIn: 'root'
})
export class CombineGuestDataService {

  constructor(private _http: RetailPosCommunication,private http:HttpServiceCall) { }

  getGuestsBySearchCriteria(guestSearchFields: API.GuestSearchFields): Promise<API.Guest[]> {  
    return this._http.postPromise<API.Guest[]>({route:RetailRoutes.GetGuestInformation,body:guestSearchFields },false);
  }
  
  
  public async MergeGuestsRecords(primaryGuest: string, secondaryGuest: string[]): Promise<boolean> {
   
    let result: any = await this.http.CallApiAsync({
        callDesc: 'CombineGuestInformation',
        host: Host.retailPOS,
        method: HttpMethod.Put,
        uriParams: { primaryGuestId: primaryGuest },
        body: secondaryGuest
      });
     
      return result;
  }

  public async GetClientDataByGuid(guestId: any):Promise<API.Guest>{
    let result: any = await this.http.CallApiAsync({
      callDesc: 'GetGuestInfoByGuid',
      host: Host.retailPOS,
      method: HttpMethod.Get,
      uriParams: { id: guestId }     
    });
   
    return result;     
    }

  public async UpdateGuestInformation(guestInfo: API.Guest):Promise<boolean>
  {
    let result: any = await this.http.CallApiAsync({
      callDesc: 'UpdateGuestInformation',
      host: Host.retailPOS,
      method: HttpMethod.Put,
      body: guestInfo     
    });
   
    return result; 
  }

  public async getGuestsByEmptySearchCriteria(filterName: string): Promise<API.Guest[]> {
    let result: any = await this.http.CallApiAsync({
      callDesc: 'EmptyFilterSearch',
      host: Host.retailPOS,
      method: HttpMethod.Put,
      uriParams :{filterName:filterName}
    });
  
    return result;
  }
}


