import { Injectable } from "@angular/core";
import { RetailDataAwaiters } from "../../../retail/shared/events/awaiters/retail.data.awaiters";
import { MatDialog } from "@angular/material";
import { RetailStandaloneLocalization } from "../../../core/localization/retailStandalone-localization";
import * as _ from "lodash";
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { PayeeInfo } from 'src/app/retail/shared/business/shared.modals';
import { ClientDataService } from '../../data-services/client.data.service';
import { ClientSearchModel, Client, ClientInfo } from 'src/app/client/client-popup/create-client/client.modal';
import { DefaultGUID } from 'src/app/common/shared/shared/globalsContant';
import { ClientPopupComponent } from 'src/app/client/client-popup/client-popup.component';

@Injectable({
    providedIn: "root"
})
export class DataAwaiterService {

    captions = this.localization.captions.bookAppointment;

    constructor(
        private dialog: MatDialog,
        private localization: RetailStandaloneLocalization,
        private routeLoaderService: RouteLoaderService,
        private clientDataService: ClientDataService
    ) {
        this.setAwaiters();
    }

    private setAwaiters(): void {
        RetailDataAwaiters.GetChildMenu = this.getChildMenu.bind(this);
        RetailDataAwaiters.searchPayee = this.searchClient.bind(this);
        RetailDataAwaiters.CreatePlayer = this.createClient.bind(this);
        RetailDataAwaiters.openAddPayeePopup = this.openAddGuestPopup.bind(this);
    }

    getChildMenu(url, menutype?){
       return this.routeLoaderService.GetChildMenu(url, menutype);
    }

    private async searchClient(name: string, requestUid: string): Promise<[ClientSearchModel[], PayeeInfo[]]> {
        let response: any = await this.clientDataService.searchClient(encodeURIComponent(name), requestUid);

        let clientDetails: PayeeInfo[] = [];
        let responseUid = "";
        if (response) {
            responseUid = response[0].requestUid;

            if ((requestUid != "" && responseUid != "" && requestUid == responseUid) || (requestUid == "" || responseUid == "")) {
                response.forEach(client => {
                    client.playerCategoryId = 1;
                    clientDetails.push(this.BuildPayeeData(client));
                });
            }            
        }
        return [response, clientDetails];
    }

    private BuildPayeeData(client: ClientSearchModel): PayeeInfo {
        let payee: PayeeInfo = {
            id: client.id,
            name: client.firstName + ' ' + client.lastName,
            address: client.addresses ? (client.addresses.addressLine1 + ' ' + client.addresses.state) : '',
            country: client.addresses  ? client.addresses.country : '',
            zip: client.addresses  ? client.addresses.zipCode : '',
            city: client.addresses  ? client.addresses.city : '',
            guestProfileId: client.guestId,
            cardInfo: client.clientCreditCardInfo,
            patronId: client.loyaltyDetail && client.loyaltyDetail[0] ? client.loyaltyDetail[0].patronId : '',
            rank: client.loyaltyDetail && client.loyaltyDetail[0] ? client.loyaltyDetail[0].rank : '',
            playerCategoryId: 1
        };
        return payee;
    }

    private async createClient(clientobj, callback): Promise<any> {
        const response = await this.clientDataService.CreateClientDetails(this.MapToClientInfoObj(clientobj));
        callback(response.id);
    }

    private MapToClientInfoObj(clientobj){
        return {
            id: clientobj.id, 
            client : {
                id: clientobj.id,
                guestId: clientobj.playerCategoryId == 1 &&  clientobj.guestId  ? clientobj.guestId : DefaultGUID,
                title: clientobj.title ? clientobj.title : "" ,
                firstName: clientobj.firstName  ? clientobj.firstName : "",
                lastName: clientobj.lastName  ? clientobj.lastName : "",
                pronounce: clientobj.pronounce  ? clientobj.pronounce : "",
                gender: clientobj.gender  ? clientobj.gender : "",
                dateOfBirth: clientobj.dateOfBirth  ? clientobj.dateOfBirth : "",
                comments:clientobj.comments  ? clientobj.comments : "",
                lastChangeId: clientobj.lastChangeId  ? clientobj.guestId : DefaultGUID,
                interfaceGuestId: clientobj.interfaceGuestId  ? clientobj.interfaceGuestId : "",
                loyaltyDetail: clientobj.loyaltyDetail  ? clientobj.loyaltyDetail : [],
                memberId: clientobj.playerCategoryId == 3 && clientobj.playerLinkId  ? clientobj.playerLinkId : null,
                ClientCategoryId: clientobj.playerCategoryId
            } as Client,  
            emails: clientobj.emails,
            addresses: clientobj.addresses,
            phoneNumbers: clientobj.phoneNumbers,
            clientCreditCardInfo: clientobj.clientCreditCardInfo ? clientobj.clientCreditCardInfo : null
          } as ClientInfo;
    }

    async openAddGuestPopup(e, callback: Function, id?, guestId?) {
        const dialogRef = this.dialog.open(ClientPopupComponent, {
            width: '95%',
            height: '85%',
            maxWidth: '95%',
            disableClose: true,
            hasBackdrop: true,
            data: { mode: 'CREATE', title: this.captions.NewClient, type: this.captions.save, data: '', closebool: true },
            panelClass: 'small-popup'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.length > 0) {                
                callback ? callback(this.BuildPayeeData(result[0])) : null;
            }
        })
    }

}
