import { Injectable } from "@angular/core";
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailPosCommunication } from '../communication/services/retailpos.service';
import { ClientInfo, ClientSearchModel, ClientGlobalSearchModel } from 'src/app/client/client-popup/create-client/client.modal';
import { ButtonType, clientSearchType } from 'src/app/retail/shared/globalsContant';
import { ApplyPolicy } from "src/app/common/consent-management/consent-management.model";
import { CommonApiRoutes } from "src/app/common/common-route";
import { RetailUtilities } from "src/app/retail/shared/utilities/retail-utilities";


@Injectable()
export class ClientDataService {

    constructor(private _httpPos: RetailPosCommunication
        , private localization: RetailStandaloneLocalization,private utils: RetailUtilities) {
    }    

    public async CreateClientDetails(requestBody: ClientInfo, handlerError: boolean = true): Promise<any> {
        return this._httpPos.postPromise({
            route: RetailApiRoute.CreateClient,
            body: requestBody
        },handlerError);
    }

    public async UpdateClientDetails(requestBody: ClientInfo,handlerError : boolean = true): Promise<any> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.UpdateClient,
            body: requestBody
        }, handlerError);
    }

    public async searchClientByPatron(patronId: string): Promise<ClientInfo> {
        return this._httpPos.getPromise({
            route: RetailApiRoute.GetClientByPatronId,
            uriParams: { patronId : patronId }
        });
    }

    public async getClientbyGuestId(guestId : string) : Promise<ClientInfo>{
            return this._httpPos.getPromise({
                route: RetailApiRoute.GetClientByGuestId,
                uriParams: { guid : guestId }
            });
        }

    public async getClientbyPlatformId(platformGuestId : string) : Promise<ClientInfo>{
            return this._httpPos.getPromise({
                route: RetailApiRoute.GetClientByGuestId,
                uriParams: { platformGuestId : platformGuestId }
            });
    }

    public async searchClient(name: string, requestUid: string,isPlatformGuestSearch: any, searchType = clientSearchType.All): Promise<ClientSearchModel[]> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.SearchClientInfo,
            body: name,
            uriParams: { searchType: searchType, requestUid: requestUid, isPlatformGuestSearch: isPlatformGuestSearch }
        });
    }

    public async searchClientForGlobalSerach(name: string): Promise<ClientGlobalSearchModel> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.GlobalSearchClientInfo,
            body: name 
        })
    }
               
    public async getClients(id : number[]): Promise<any[]> {
        return this._httpPos.putPromise({
            route: RetailApiRoute.GetClientByIds,
            body: id,
            uriParams: { includeRelatedData: false }
        });
    }
    public async GetGuestByPlatformGuestGuid(platformGuestGuid: string):Promise<ClientInfo> {
        var response: any = await this._httpPos.getPromise({
            route: RetailApiRoute.GetClientByPlatformGuestUuid,
            showError: true,
            uriParams: { platformGuid: platformGuestGuid }
        });
        return response;
    }
    public async getGuestStayDetails(guestId: string): Promise<any[]> {
        return this._httpPos.getPromise({
            route: RetailApiRoute.GetClientStayDetails,
            uriParams: { clientId: guestId }
        });
    }
    public async updatePolicyDetailsForGuestId(applyPolicy: ApplyPolicy): Promise<boolean> {
        const result = await this._httpPos.postPromise<boolean>(
            { route: RetailApiRoute.UpdateConsentPolicyDetailsForGuestId, body: applyPolicy });
            return result;
      }

      public async getMemberInfo(cardNo: string, scheduleDateTime: string): Promise<any> {
        const result = await this._httpPos.getPromise({
            route: RetailApiRoute.GetMemberInfoByCardNo,
            uriParams : { cardNo: cardNo, scheduleDateTime: scheduleDateTime }}
        );
        return result;
	}
}
