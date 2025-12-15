import { Injectable } from "@angular/core";
import { RetailDataAwaiters } from "../../../retail/shared/events/awaiters/retail.data.awaiters";
import { MatDialog } from "@angular/material/dialog";
import { RetailStandaloneLocalization } from "../../../core/localization/retailStandalone-localization";
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { PayeeInfo } from 'src/app/retail/shared/business/shared.modals';
import { ClientDataService } from '../../data-services/client.data.service';
import { ClientSearchModel, Client, ClientInfo } from 'src/app/client/client-popup/create-client/client.modal';
import { DefaultGUID,ENGAGE_INTERFACE } from 'src/app/common/shared/shared/globalsContant';
import { ClientPopupComponent } from 'src/app/client/client-popup/client-popup.component';
import { UserdefaultsInformationService } from 'src/app/core/services/UserdefaultsInformationService';
import { first } from 'rxjs/operators';
import { NotificationDataService } from '../../data-services/notification.data.service';
import { NotifyPopupComponent } from '../../components/notify-popup/notify-popup.component';
import { BreakPoint } from '../../models/breakpoint-models';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';
import * as RetailClientInfo from 'src/app/retail/shared/shared.modal';
import { NotificationConfigurationService } from "src/app/common/templates/notification-configuration/notification-configuration.service";
import { EventNotificationGroup } from "src/app/common/templates/notification-configuration/notification-configuration.model";
import { PropertySettingDataService } from "src/app/retail/sytem-config/property-setting.data.service";
import { CommonDataAwaiters } from "src/app/common/shared/events/awaiters/common.data.awaiters";
import { VipTypBusiness } from "src/app/retail/shared/service/vip-type.service";
import { ClientMultipack, MultiPackReturn } from "src/app/retail/retail.modals";
import { TransactionService } from "src/app/retail/shared/service/transaction-service/transaction.dataservice";
import { clientSearchType, RetailBreakPoint } from "src/app/retail/shared/globalsContant";
import { GuestTypeBusiness } from "src/app/retail/common/services/guest-type.service";
import { UserAccessBreakPoints } from "src/app/common/constants/useraccess.constants";

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
        private userAccessBusiness : UserAccessBusiness,
        private notificationConfigurationService: NotificationConfigurationService,
        private propertySettingDataService: PropertySettingDataService,
        private vipTypeBusiness: VipTypBusiness,
        private guestTypeBusiness: GuestTypeBusiness,
        private transactionService: TransactionService
    ) {
        this.setAwaiters();
    }

    private setAwaiters(): void {
        RetailDataAwaiters.GetChildMenu = this.getChildMenu.bind(this);
        RetailDataAwaiters.searchPayee = this.searchClient.bind(this);
        RetailDataAwaiters.searchTransactionGuest = this.searchClient.bind(this);
        RetailDataAwaiters.CreatePlayer = this.createClient.bind(this);
        RetailDataAwaiters.GetGuestByPlatformGuestGuid = this.GetGuestByPlatformGuestGuid.bind(this);
        RetailDataAwaiters.openAddPayeePopup = this.openAddGuestPopup.bind(this);
        RetailDataAwaiters.getPayeeDetails = this.getClientDetails.bind(this);
        RetailDataAwaiters.getPayeeInfo = this.getClientInfo.bind(this);
        RetailDataAwaiters.getMemberInfo = this.getMemberInfo.bind(this);
        RetailDataAwaiters.GetDefaultOutlet = this.GetDefaultOutlet.bind(this);
        RetailDataAwaiters.SendNotification = this.SendNotification.bind(this);
        RetailDataAwaiters.OpenManualNotifyPopup = this.OpenManualNotifyPopup.bind(this);
        RetailDataAwaiters.getGuestStayDetails = this.getGuestStayDetails.bind(this);

        RetailDataAwaiters.GetExistingPlayer = this.getExistingPlayer.bind(this);
        RetailDataAwaiters.openGuestPatronPopup = this.openGuestPatronPopup.bind(this);
        RetailDataAwaiters.GetExtendedProfileSearchConfig = this.GetExtendedProfileSearchConfig.bind(this);

        //VipType
        CommonDataAwaiters.GetAllVipType = this.getAllVipType.bind(this);
        CommonDataAwaiters.CreateVipType = this.createVipType.bind(this);
        CommonDataAwaiters.UpdateVipType = this.updateVipType.bind(this);
        CommonDataAwaiters.DeleteVipType = this.deleteVipType.bind(this);
        CommonDataAwaiters.GetNextListOrderofVipType = this.getNextListOrderofVipType.bind(this);
        CommonDataAwaiters.DragDropVipType = this.dragDropVipType.bind(this);
        CommonDataAwaiters.GetVipTypeBreakpoint = this.GetVipTypeBreakpoint.bind(this);  


        //GuestType
        CommonDataAwaiters.GetAllGuestTypes = this.getAllGuestTypes.bind(this);
        CommonDataAwaiters.CreateGuestType = this.createGuestType.bind(this);
        CommonDataAwaiters.UpdateGuestType = this.updateGuestType.bind(this);
        CommonDataAwaiters.DeleteGuestType = this.deleteGuestType.bind(this);
        CommonDataAwaiters.DragDropGuestType = this.dragDropGuestType.bind(this);
        CommonDataAwaiters.GetGuestTypeBreakpoint = this.getGuestTypeBreakPoint.bind(this);

        //Client Multipack
        RetailDataAwaiters.GetClientMultiPack = this.getClientMultiPacksBytransactionId.bind(this);
        RetailDataAwaiters.UpdateMultiPack = this.updateMultiPack.bind(this);
    }

    getChildMenu(url, menutype?) {
        return this.routeLoaderService.GetChildMenu(url, menutype);
    }

    async openGuestPatronPopup(e, callback: Function, id?, guestId?) {
       this.openAddGuestPopup(e, callback, undefined, guestId, undefined, id);
    }

     private async GetVipTypeBreakpoint(){
        return UserAccessBreakPoints.VipType;
    }
    
    private async getExistingPlayer(patronId) {
        let client = await this.clientDataService.searchClientByPatron(patronId);
        return client;
    }

    async getClientMultiPacksBytransactionId(transactionId: number): Promise<ClientMultipack[]> {
        return await this.transactionService.getClientMultiPacksBytransactionId(transactionId);
    }

    async updateMultiPack(multipackreturn: MultiPackReturn) {
        const response = await this.transactionService.updateMultiPack(multipackreturn);
        return response;
    }

    private async searchClient(name: string, type: number, requestUid: string, isPlatformGuestSearch:any, isExternalGuestSearch: boolean = false, isSearchGuestByconfirmationNumber: boolean = false): Promise<[ClientSearchModel[], PayeeInfo[]]> {
        let searchType = isSearchGuestByconfirmationNumber? clientSearchType.confirmationNumber : clientSearchType.All;
        let response: any = await this.clientDataService.searchClient(name, requestUid, isPlatformGuestSearch, searchType);

        let clientDetails: PayeeInfo[] = [];
        let responseUid = "";
        if (response && response.length > 0) {
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
            address: client.addresses ? (client.addresses.addressLine1 ? client.addresses.addressLine1 : ''  + ' ' + client.addresses.state ? client.addresses.state : '') : '',
            country: client.addresses ? client.addresses.country ? client.addresses.country : '' : '',
            zip: client.addresses ? client.addresses.zipCode ? client.addresses.zipCode : '' : '',
            city: client.addresses ? client.addresses.city ? client.addresses.city : '' : '',
            guestProfileId: client.memberId ? client.memberId : client.guestId,
            cardInfo: client.clientCreditCardInfo ? client.clientCreditCardInfo : [],
            patronId: client.loyaltyDetail && client.loyaltyDetail[0] ? client.loyaltyDetail[0].patronId : '',
            rank: client.loyaltyDetail && client.loyaltyDetail[0] ? client.loyaltyDetail[0].rank : '',
            playerCategoryId: client.clientCategoryId != 0 ? client.clientCategoryId : 1,
            emailId: emailId,
            phoneNumber: phoneNo,
            lastName: client.lastName,
            platformGuestUuid: client.platformGuestUuid,
            vip: client.vip,
            guestTypeId: client.guestType,
            vipTypeId: client.vipTypeId,
            guestTypeCategories: client.guestTypeCategories ? client.guestTypeCategories : []
        };
        return payee;
    }
    private BuildPayeeDataFromClientInfo(client: ClientInfo): PayeeInfo {
        let emailId = '';
        let phoneNo = '';
        let emailObj = client.emails;
        let phoneObj = client.phoneNumbers;

        if (emailObj && emailObj.length) {
            emailObj = emailObj.sort((a, b) => a.contactTypeId < b.contactTypeId ? -1 : a.contactTypeId > b.contactTypeId ? 1 : 0);
            emailId = emailObj.find(x => !x.isPrivate && x.isPrimary) ? emailObj.find(x => !x.isPrivate && x.isPrimary).emailId : emailObj[0].emailId;
        }

        if (phoneObj && phoneObj.length) {
            phoneObj = phoneObj.sort((a, b) => a.contactTypeId < b.contactTypeId ? -1 : a.contactTypeId > b.contactTypeId ? 1 : 0);
            phoneNo = phoneObj.find(x => !x.isPrivate && x.isPrimary) ? phoneObj.find(x => !x.isPrivate && x.isPrimary).number : phoneObj[0].number;
        }

        let payee: PayeeInfo = {
            id: client.id,
            name: client.client.firstName + ' ' + client.client.lastName,
            address: client.addresses ? (client.addresses.addressLine1 ? client.addresses.addressLine1 : '' + ' ' + client.addresses.state ? client.addresses.state : '') : '',
            country: client.addresses ? client.addresses.country ? client.addresses.country : '' : '',
            zip: client.addresses ? client.addresses.zipCode ? client.addresses.zipCode : '' : '',
            city: client.addresses ? client.addresses.city ? client.addresses.city : '' : '',
            guestProfileId: client.client.memberId ? client.client.memberId : client.client.guestId,
            cardInfo: client.client.clientCreditCardInfo ? client.client.clientCreditCardInfo : [],
            patronId: client.client.loyaltyDetail && client.client.loyaltyDetail[0] ? client.client.loyaltyDetail[0].patronId : '',
            rank: client.client.loyaltyDetail && client.client.loyaltyDetail[0] ? client.client.loyaltyDetail[0].rank : '',
            playerCategoryId: client.client.clientCategoryId != 0 ? client.client.clientCategoryId : 1,
            emailId: emailId,
            phoneNumber: phoneNo,
            lastName: client.client.lastName,
            platformGuestUuid: client.client.platformGuestUuid,
            guestTypeId: client.client.guestType,
            vipTypeId: client.client.vipTypeId,
            guestTypeCategories: client.guestTypeCategories ? client.guestTypeCategories : []          
        };

        if(client.isMember ){
            const engageMember = client?.interfaces?.find(
                (y: any) => y.name.toLowerCase() == ENGAGE_INTERFACE.toLowerCase()
            );

            if (engageMember) {
                payee.isMember = true;
                payee.playerLinkId = engageMember.interfaceGuestId;
            }
        }
        return payee;
    }
    private async createClient(clientobj, callback): Promise<any> {
        if(clientobj.platformGuestUuid && clientobj.platformGuestUuid != DefaultGUID){
            var platformGuest = await this.clientDataService.GetGuestByPlatformGuestGuid(clientobj.platformGuestUuid);
            if(platformGuest && platformGuest.client?.id == 0) { 
                const response = await this.clientDataService.CreateClientDetails(platformGuest);
                return callback(response.id);
            } else{
                return callback(platformGuest.client.id);
            }
        }

        const response = await this.clientDataService.CreateClientDetails(this.MapToClientInfoObj(clientobj));
        return callback(response.id);
    }

    private MapToClientInfoObj(clientobj) {
        let phones: any[] = [];
        let emails: any[] = [];

        if (clientobj?.contactInformation?.length) {
            phones = clientobj.contactInformation.filter(x => x.name === "Phone");
            emails = clientobj.contactInformation.filter(x => x.name === "Email");
        }

        return {
            id: clientobj.id,
            client: {
                id: clientobj.id,
                guestId: clientobj.playerCategoryId == 1 && clientobj.guestId ? clientobj.guestId : DefaultGUID,
                title: clientobj.title || "",
                firstName: clientobj.firstName || "",
                lastName: clientobj.lastName || "",
                pronounce: clientobj.pronounce || "",
                gender: clientobj.gender || "",
                dateOfBirth: clientobj.dateOfBirth || "",
                comments: clientobj.comments || "",
                lastChangeId: clientobj.lastChangeId ? clientobj.guestId : DefaultGUID,
                interfaceGuestId: clientobj.interfaceGuestId || "",
                loyaltyDetail: clientobj.loyaltyDetail || [],
                memberId: clientobj.playerCategoryId == 3 ? clientobj.playerLinkId : null,
                clientCategoryId: clientobj.playerCategoryId
            } as Client,
            emails: emails.map(e => ({
                id: 0,
                emailId: e.value,
                isPrimary: e.isPrimary,
                contactTypeId: e.type,
                isPrivate: e.isPrivateInfo
            })),
            addresses: clientobj.addresses,
            // PHONE ARRAY MAPPING
            phoneNumbers: phones.map(p => ({
                id: 0,
                number: p.value,
                isPrimary: p.isPrimary,
                contactTypeId: p.type,
                isPrivate: p.isPrivateInfo
            })),

            clientCreditCardInfo: clientobj.clientCreditCardInfo || null
        } as ClientInfo;
    }


    async openAddGuestPopup(e, callback: Function, id?, guestId?,  modifyLineItemsCallback?: Function,platformGuestUuid?: any, patronId?) {
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
                    data: { mode: 'CREATE', title: this.captions.NewClient, type: this.captions.save, data: '', closebool: true, patronId: patronId },
                    panelClass: 'small-popup'
                });
            }
        } else if(e.toLowerCase() == "ordersummaryedit") {
            var result = await this.userAccessBusiness.getUserAccess(BreakPoint.EditClientProfile);
            if (result.isAllow || result.isViewOnly) {
                if ((guestId == '' || guestId == DefaultGUID) && (platformGuestUuid && platformGuestUuid != '' && platformGuestUuid != DefaultGUID)){
                    var clientInfo = await this.clientDataService.getClientbyPlatformId(platformGuestUuid);
                }
                else
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
                    cardInfo: [],
                    guestId: client.id.toString(),
                    emailId: client.emails.find(x=> !x.isPrivate && x.isPrimary) ? client.emails.find(x=> !x.isPrivate && x.isPrimary)?.emailId : client.emails[0]?.emailId
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
    public async GetGuestByPlatformGuestGuid(platformGuestGuid: string) {
        var response = await this.clientDataService.GetGuestByPlatformGuestGuid(platformGuestGuid);
        return this.BuildPayeeDataFromClientInfo(response);
    }
    GetDefaultOutlet() {
        return this.userDefaultService.GetDefaultOutlet();
    }

    async SendNotification(clientInfo: RetailClientInfo.ClientInfo, emailId: any[] = [], isDistributionListRequired: boolean = true) {
        const eventConfiguration: EventNotificationGroup[] = await this.notificationConfigurationService.GetEventNotificationGroupByProduct();
        const guesteventConfiguration = eventConfiguration.filter(x => x.groupName === "Guest");
        let canSendemail: boolean, canSendSMS: boolean ;
        if(guesteventConfiguration && guesteventConfiguration.length > 0){
            canSendemail = guesteventConfiguration[0].sendMail;
            canSendSMS = guesteventConfiguration[0].sendSMS;
        }
        this.notificationDataService.SendNotification(clientInfo.transactionId, false, emailId, '', canSendSMS,canSendemail,clientInfo.reportQuery,true,isDistributionListRequired);
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

    private async getGuestStayDetails(guestId: string) {
        return await this.clientDataService.getGuestStayDetails(guestId);
    }

    private async getMemberInfo(cardNo: string, scheduleDateTime: string){
        return await this.clientDataService.getMemberInfo(cardNo, scheduleDateTime);
    }
    private async GetExtendedProfileSearchConfig() : Promise<boolean>
    {
        let platformGuestSearch = await this.propertySettingDataService.GetEnableExtendedProfileSearchByDefaultSetting();
        return platformGuestSearch && platformGuestSearch.value === 'true' ? true : false;
    }
    private async getAllVipType(includeInactive) {
        return this.vipTypeBusiness.getAllVipType(includeInactive);
    }

    private async createVipType(vipType) {
        return this.vipTypeBusiness.createVipType(vipType);
    }

    private async updateVipType(vipType, id) {
        return this.vipTypeBusiness.updateVipType(vipType, id);
    }

    private async deleteVipType(id){
        return this.vipTypeBusiness.deleteVipType(id);
    }

    private async getNextListOrderofVipType(){
        return this.vipTypeBusiness.getNextListOrderofVipType();
    }

    private async dragDropVipType(fromOrder, toOrder, includeInactive){
        return this.vipTypeBusiness.dragDropVipType(fromOrder, toOrder, includeInactive);
    }

    private async getAllGuestTypes(includeInactive) {
        return await this.guestTypeBusiness.getAllGuestTypes(includeInactive);
    }

    private async createGuestType(guestType) {
        return await this.guestTypeBusiness.createGuestType(guestType);
    }

    private async updateGuestType(guestType) {
        return await this.guestTypeBusiness.updateGuestType(guestType);
    }

    private async deleteGuestType(id){
        return await this.guestTypeBusiness.deleteGuestType(id);
    }

    private async dragDropGuestType(fromOrder, toOrder){
        return await this.guestTypeBusiness.dragDropGuestType(fromOrder, toOrder);
    }

    private async getGuestTypeBreakPoint() {
        return RetailBreakPoint.GuestType
    }
}
