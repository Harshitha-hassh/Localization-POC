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
import { UserdefaultsInformationService } from 'src/app/core/services/UserdefaultsInformationService';
import { first } from 'rxjs/operators';
import { NotificationDataService } from '../../data-services/notification.data.service';
import { NotifyPopupComponent } from '../../components/notify-popup/notify-popup.component';
import { BreakPoint } from '../../models/breakpoint-models';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';

@Injectable({
    providedIn: "root"
})
export class DataAwaiterService {

    captions = this.localization.captions.bookAppointment;

    constructor(
        private dialog: MatDialog,
        private localization: RetailStandaloneLocalization,
        private routeLoaderService: RouteLoaderService,
        private clientDataService: ClientDataService,
        private userDefaultService: UserdefaultsInformationService,
        private notificationDataService: NotificationDataService,
        private userAccessBusiness : UserAccessBusiness
    ) {
        this.setAwaiters();
    }

    private setAwaiters(): void {
        RetailDataAwaiters.GetChildMenu = this.getChildMenu.bind(this);
        RetailDataAwaiters.searchPayee = this.searchClient.bind(this);
        RetailDataAwaiters.CreatePlayer = this.createClient.bind(this);
        RetailDataAwaiters.openAddPayeePopup = this.openAddGuestPopup.bind(this);
        RetailDataAwaiters.getPayeeDetails = this.getClientDetails.bind(this);
        RetailDataAwaiters.getPayeeInfo = this.getClientInfo.bind(this);
        RetailDataAwaiters.GetDefaultOutlet = this.GetDefaultOutlet.bind(this);
        RetailDataAwaiters.SendNotification = this.SendNotification.bind(this);
        RetailDataAwaiters.OpenManualNotifyPopup = this.OpenManualNotifyPopup.bind(this);
    }

    getChildMenu(url, menutype?) {
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
        let emailId = '';
        let phoneNo = '';
        let emailObj = client.emails;
        let phoneObj = client.phoneNumbers;

        if (emailObj && emailObj.length) {
            emailObj = emailObj.sort((a, b) => a.contactTypeId < b.contactTypeId ? -1 : a.contactTypeId > b.contactTypeId ? 1 : 0);
            emailId = emailObj.find(x=> !x.isPrivate && x.isPrimary) ? emailObj.find(x=> !x.isPrivate && x.isPrimary).emailId :  emailObj[0].emailId;
        }

        if(phoneObj && phoneObj.length) {
            phoneObj = phoneObj.sort((a, b) => a.contactTypeId < b.contactTypeId ? -1 : a.contactTypeId > b.contactTypeId ? 1 : 0);
            phoneNo = phoneObj.find(x=> !x.isPrivate && x.isPrimary) ? phoneObj.find(x=> !x.isPrivate && x.isPrimary).number :  phoneObj[0].number;
        }

        let payee: PayeeInfo = {
            id: client.id,
            name: client.firstName + ' ' + client.lastName,
            address: client.addresses ? (client.addresses.addressLine1 + ' ' + client.addresses.state) : '',
            country: client.addresses ? client.addresses.country : '',
            zip: client.addresses ? client.addresses.zipCode : '',
            city: client.addresses ? client.addresses.city : '',
            guestProfileId: client.guestId,
            cardInfo: client.clientCreditCardInfo ? [client.clientCreditCardInfo] : null,
            patronId: client.loyaltyDetail && client.loyaltyDetail[0] ? client.loyaltyDetail[0].patronId : '',
            rank: client.loyaltyDetail && client.loyaltyDetail[0] ? client.loyaltyDetail[0].rank : '',
            playerCategoryId: 1,
            emailId: emailId,
            phoneNumber: phoneNo 
        };
        return payee;
    }

    private async createClient(clientobj, callback): Promise<any> {
        const response = await this.clientDataService.CreateClientDetails(this.MapToClientInfoObj(clientobj));
        callback(response.id);
    }

    private MapToClientInfoObj(clientobj) {
        return {
            id: clientobj.id,
            client: {
                id: clientobj.id,
                guestId: clientobj.playerCategoryId == 1 && clientobj.guestId ? clientobj.guestId : DefaultGUID,
                title: clientobj.title ? clientobj.title : "",
                firstName: clientobj.firstName ? clientobj.firstName : "",
                lastName: clientobj.lastName ? clientobj.lastName : "",
                pronounce: clientobj.pronounce ? clientobj.pronounce : "",
                gender: clientobj.gender ? clientobj.gender : "",
                dateOfBirth: clientobj.dateOfBirth ? clientobj.dateOfBirth : "",
                comments: clientobj.comments ? clientobj.comments : "",
                lastChangeId: clientobj.lastChangeId ? clientobj.guestId : DefaultGUID,
                interfaceGuestId: clientobj.interfaceGuestId ? clientobj.interfaceGuestId : "",
                loyaltyDetail: clientobj.loyaltyDetail ? clientobj.loyaltyDetail : [],
                memberId: clientobj.playerCategoryId == 3 && clientobj.playerLinkId ? clientobj.playerLinkId : null,
                ClientCategoryId: clientobj.playerCategoryId
            } as Client,
            emails: clientobj.emails,
            addresses: clientobj.addresses,
            phoneNumbers: clientobj.phoneNumbers,
            clientCreditCardInfo: clientobj.clientCreditCardInfo ? clientobj.clientCreditCardInfo : null
        } as ClientInfo;
    }

    async openAddGuestPopup(e, callback: Function, id?, guestId?) {
        let dialogRef = null;
        if (e.toLowerCase() == "ordersummary" ) {
            var result = await this.userAccessBusiness.getUserAccess(BreakPoint.AddNewClientProfile);
            if (result.isAllow || result.isViewOnly) {
                dialogRef = this.dialog.open(ClientPopupComponent, {
                    width: '95%',
                    height: '85%',
                    maxWidth: '95%',
                    disableClose: true,
                    hasBackdrop: true,
                    data: { mode: 'CREATE', title: this.captions.NewClient, type: this.captions.save, data: '', closebool: true },
                    panelClass: 'small-popup'
                });
            }
        } else if(e.toLowerCase() == "ordersummaryedit") {
            var result = await this.userAccessBusiness.getUserAccess(BreakPoint.EditClientProfile);
            if (result.isAllow || result.isViewOnly) {
                var clientInfo = await this.clientDataService.getClientbyGuestId(guestId);
                dialogRef = this.dialog.open(ClientPopupComponent, {
                    width: '95%',
                    height: '85%',
                    disableClose: true,
                    hasBackdrop: true,
                    data:  { mode: 'EDIT', title: this.captions.EditClient, type: this.captions.Update,id :id ,
                     data: clientInfo, closebool: true, isClientViewOnly : result.isViewOnly },
                    panelClass: 'small-popup'
                });
            }
        }
        
        if(dialogRef && callback){
            dialogRef.afterClosed().pipe(first()).subscribe(result => {
                if (result) {
                    callback ? callback(this.BuildPayeeData(result)) : null;
                }
            });
        }
    }
    private async getClientDetails(id: number[]): Promise<PayeeInfo[]> {
        let response: any = await this.clientDataService.getClients(id);
        let clientDetails: PayeeInfo[] = [];
        if (response && response.length > 0) {
            response.forEach(client => {
                clientDetails.push({
                    id: client.id,
                    name: client.firstName + ' ' + client.lastName,
                    guestProfileId: client.guestId,
                    address: '',
                    country: '',
                    city: '',
                    zip: '',
                    cardInfo: []
                });
            });
        }
        return clientDetails;
    }

    private async getClientInfo(id: number): Promise<PayeeInfo> {
        let response: any = await this.clientDataService.getClients([id]);
        let clientDetails: PayeeInfo;
        if (response && response.length > 0) {
            const client = response[0];
            clientDetails = this.BuildPayeeData(client);
        }
        return clientDetails;
    }

    GetDefaultOutlet() {
        return this.userDefaultService.GetDefaultOutlet();
    }

    async SendNotification(transactionId: number) {
        this.notificationDataService.SendNotification(transactionId, false );
    }

    OpenManualNotifyPopup(transactionId: number, guestId: number ) {
        let dialogRef = this.dialog.open(NotifyPopupComponent, {
            width: '85%',
            height: '75%',
            disableClose: true,
            hasBackdrop: true,
            data:  { mode: 'EDIT', title: this.captions.notify, type: this.captions.Update, guestId :guestId, transactionId: transactionId, closebool: true },
            panelClass: 'small-popup'
        });
    }
}
