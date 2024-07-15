import { Injectable } from "@angular/core";
import { RetailRoutes } from "src/app/retail/retail-route";
import { BaseResponse } from "src/app/retail/shared/business/shared.modals";
import { Host } from "src/app/retail/shared/globalsContant";
import { HttpMethod, HttpServiceCall } from "src/app/retail/shared/service/http-call.service";
import { ClientInfo } from "src/app/retail/shop/shop.modals";
import {API} from "src/app/settings/retail-utilities/cgps-logging-profile-sync-wrapper/cgps-logging-profile-sync-wrapper.model";
import { RetailPosCommunication } from "../communication/services/retailpos.service";

@Injectable()
export class CgpsLoggingProfileSyncWrapperDataService
{
    constructor(private retailHttp: RetailPosCommunication, private http: HttpServiceCall)
    {

    }

    public getFailedProfile() : Promise<API.FailedProfile[]>    {
        const result = this.retailHttp.getPromise<API.FailedProfile[]>(
            {route : RetailApiRoute.GetAllFailedGuestProfile},false);
        return result;
    }

    public DateRangeProfileSync(profileSyncInfo : API.ProfileSyncInfo)
    {
        let result = this.retailHttp.postPromise(
            { route: RetailApiRoute.ProfileSyncManaulTrigger, body: profileSyncInfo }, false);
        return result;
    }

    public SingleProfileSync(profileSyncInfo : API.ProfileSyncInfo)
    {
        let result = this.retailHttp.postPromise(
            { route: RetailApiRoute.ProfileSyncManaulTrigger, body: profileSyncInfo }, false);
        return result;
    }

    public async getClientInfobyGuid(GuidID: string): Promise<ClientInfo> {
        let response: BaseResponse<ClientInfo> = await this.http.CallApiAsync<ClientInfo>({
            callDesc: RetailRoutes.GetClientInfobyGuid,
            host: Host.retailPOS,
            method: HttpMethod.Get,
            uriParams: { guid: GuidID }
        });
        return response.result;
    }
}