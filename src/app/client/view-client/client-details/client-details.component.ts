import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
// import { AppointmentPopupComponent } from '../../../shared/appointment-popup/appointment-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import * as _ from 'lodash';
import { BaseResponse, KeyValuePair, clientInfoDisplay, ClientLabel, Imagedata, Email, PhoneNumber } from '../../../shared/shared-models';
import { ClientService } from '../../../shared/service/client-service.service';
import { PropertyInformation } from '../../../core/services/property-information.service';
import { ActivatedRoute } from '@angular/router';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { FormatText } from 'src/app/common/shared/shared/pipes/formatText-pipe.pipe';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { DefaultGUID, clientSearchType } from 'src/app/retail/shared/globalsContant';
import { AppModuleService } from 'src/app/core/services/app.service';
import { ClientPopupComponent } from '../../client-popup/client-popup.component';
import { RetailImageService } from 'src/app/shared/data-services/retail.image.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';
import { UserAccessDataService } from 'src/app/common/dataservices/authentication/useraccess.data.service';
import { BreakPoint } from 'src/app/shared/models/breakpoint-models';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PropertySettingDataService } from 'src/app/retail/sytem-config/property-setting.data.service';


@Component({
    selector: 'app-client-details',
    templateUrl: './client-details.component.html',
    styleUrls: ['./client-details.component.scss'],
    providers: [UserAccessBusiness, UserAccessDataService],
    animations: [
        trigger(
            'enterAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('1s', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('1s', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ]
        )
    ],
    encapsulation: ViewEncapsulation.None
})
export class ClientDetailsComponent implements OnInit {
    @ViewChild('tableInput') tableInput: ElementRef;
    captions = this.localization.captions.bookAppointment;
    searchText = '';
    TablebodyData = [];
    tableoptions = [{
        TableHdrData:
            [{ title: this.captions.BasicInformation, jsonkey: 'client', alignType: 'left', datatype: 'client', searchable: true, sortable: true },
            { title: this.captions.PatronID, jsonkey: 'patronId', alignType: 'left', searchable: false, sortable: true },
            { title: this.captions.Gender, jsonkey: 'gender', alignType: 'left', datatype: 'icon', searchable: false, sortable: false },
            { title: this.captions.DateOfBirth, jsonkey: 'dateOfBirth', alignType: 'left', searchable: false, sortable: true },
            { title: this.captions.Address, jsonkey: 'address', alignType: 'left', searchable: false, sortable: false },
            { title: this.captions.PhoneNumber, jsonkey: 'phoneNumber', alignType: 'left', searchable: true, sortable: false, hover: 'phoneNumbers' },
            ],
        TablebodyData: this.TablebodyData,
        ServiceId: 99,
        sortable: true,
        CustomColumn: true,
        TableSearchText: this.searchText,
        PlaceHoldertext: 'search by',
        EnableActions: true,
        SelectedSettingId: 99,
        Sortable: this.clientService.selectedIndex != 1 ? 'client' : '',
        SelectRows: false,
        Searchable: false,
        EditMoreOption: true, //No appointment selection s thr
        disableDelete: true
    }];
    isVip: any = false;
    clientData: any = [];
    imageList: Imagedata[];
    selectedClient: any = [];
    Appointments: any[] = [];
    filteredGender: any = [];
    filteredCity: any = [];
    innerfilterArray: any = [];
    searchTextPlaceHolder: string;
    userData: clientInfoDisplay = {
        name: '',
        age: '',
        gender: '',
        email: [],
        phone: [],
        address: ''
    };

    viewCheckedFlag = false;
    selectedArray: any = [];
    singleUserView = false;

    isClientViewOnly = false;
    showFilterPopOver = false;
    isAddAppointment = false;
    formattedData: any = [];
    left = 0;
    top = 0;
    enableStickyColumn = true;
    formattedPhoneNo: any;
    formattedEmail: any;
    formattedPhoneNos: any;
    formattedEmails: any;
    guestId: any;
    arrayCount: any = 0;
    guestArray: any = [];
    guestNames: any;
    guestNameFromGlobalSearch: string = '';
    guidFromGlobalSearch: string = '';
    requestUid = '';
    timer = null;
    floatLabel: string;
    floatLabelNever: string;
    clientSearchTypes: any;
    selectedClientSearchType: number;
    enableSearch: boolean = false;
    isPlatformGuestSearch: boolean = false;
    platFormExtendedSearchRequired: boolean = false;
    ClientSearchForm: UntypedFormGroup;
    isCopyClient = false;
    clientSearchValue: string;
    clientNameInfo: any = {};
    constructor(private dialog: MatDialog, private fb: UntypedFormBuilder,
        private localization: RetailStandaloneLocalization, public http: HttpServiceCall, private utils: RetailUtilities, public _imageService: RetailImageService,
        public clientService: ClientService, public _as: AppModuleService, private PropertyInfo: PropertyInformation, public formatphno: FormatText, public route: ActivatedRoute
        , private userAccessBusiness: UserAccessBusiness , private propertySettingService : PropertySettingDataService) {
        this.floatLabel = this.localization.setFloatLabel;
        this.floatLabelNever = this.localization.setFloatLabelNever;
        route.params.subscribe(val => {
            if (this._as.isglobalSearch) {
                this.clientService.selectedIndex = 0;
                this.guestNameFromGlobalSearch = this._as.selectedClient.name;
                this.guidFromGlobalSearch = this._as.selectedClient.guestProfileId;
                this.searchText = '';
                this.selectedClientSearchType = clientSearchType.firstName;
                this.SearchClientInformation(this._as.selectedClient.name, false, this._as.selectedClient.guestProfileId, this.selectedClientSearchType);
            }
        });
        this.clientSearchTypes = [{ id: 0, name: this.captions.firstName, checked: true },
        { id: 1, name: this.captions.lastName, checked: false },
        { id: 2, name: this.captions.name, checked: false },
        { id: 3, name: this.captions.phone, checked: false },
        { id: 4, name: this.captions.email, checked: false },
        { id: 5, name: this.captions.patronId, checked: false }
        ];
    }
    sampleData: any = [];

    ngOnInit() {
        this.platFormExtendedSearchRequired = this.localization.IsPlatformGuestSearchConfigured();
        this.ClientSearchForm = this.fb.group({
            platformGuestSearch: this.isPlatformGuestSearch,
        })
        this.setPlatformGuestSearch();
        let clientswitchvalue = this.clientSearchTypes.find(t => t.checked == true);
        this.setSearchText(clientswitchvalue?.id);
        this.SetclientSearchTypeValue(clientswitchvalue?.id);
        if (this.route.snapshot.routeConfig.path == 'allclients') { this.clientService.selectedIndex = 0; }
        if (this.route.snapshot.routeConfig.path == 'recents') { this.clientService.selectedIndex = 1; }
        else if (this.route.snapshot.routeConfig.path == 'vip') { this.clientService.selectedIndex = 2; }

        this.sampleData = _.cloneDeep(this.TablebodyData);
        this.selectedClient = [];
        this.innerfilterArray.forEach(element => {
            element.selected = 0;
        });
        this.selectedArray = _.cloneDeep(this.innerfilterArray);
        this.selectedArray.forEach(element => {
            element.values = [];
        });
        if (this.clientService.selectedIndex == 1) {
            this.RecentClientInformation(this.searchText, this.selectedClientSearchType);

            this.selectedClient = [];
            this.clientService.isVip = false;
        }
        else if (this.clientService.selectedIndex == 2) {
            this.selectedClient = [];
            this.clientService.isVip = true;
        }
        else {
            this.selectedClient = [];
            this.clientService.isVip = false;
        }
        this.FilterClientInformation();
    }

    // Client Search Header actions
    /**
     * @function addNewClient
     * @description Opens new dialog to create a client
     */
    addNewClient = async (event) => {
        var result = await this.userAccessBusiness.getUserAccess(BreakPoint.AddNewClientProfile);
        if (result.isAllow || result.isViewOnly) {
            // this.appointmentservice.add_client = true;
            // this.appointmentservice.IsAddClientFromSPA = true;
            // this.appointmentservice.ImgTempHolder = {};
            // this.appointmentservice.popupTitle = this.captions.NewClient;
            let firstName = "";
            let lastName = "";
            let email: Email[] = [];
            let phone: PhoneNumber[] = [];
            this.clientSearchValue = this.searchText;
            if (this.clientSearchValue) {

                switch (this.selectedClientSearchType) {
                    case clientSearchType.firstName:
                        firstName = this.clientSearchValue;
                        break;
                    case clientSearchType.lastName:
                        lastName = this.clientSearchValue;
                        break;
                    case clientSearchType.name:
                        let name  =  this.clientSearchValue.split(" ");
                        if(name.length > 1)
                        {
                            lastName = name[name.length -1];
                            name.splice(-1, 1);
                            firstName = name.join(' ');
                        }
                        else{
                            firstName = name[0]; 
                        }                                              
                        break;
                    case clientSearchType.email:
                        let emailsearch: Email = {
                            id: 0,
                            emailId: this.clientSearchValue,
                            contactTypeId: 9,
                            clientId: 0,
                            isPrimary: false,
                            isPrivate: false,
                            propertyId: 0,
                            subPropertyId: 0,
                        };
                        email.push(emailsearch);
                        break;
                    case clientSearchType.phone:
                        let number = Number(this.clientSearchValue);
                        let phoneSearch: any = {
                            clientId: 0,
                            contactTypeId: 1,
                            extension: null,
                            id: 0,
                            isPrimary: false,
                            isPrivate: false,
                            number:  isNaN(number) ? "" : this.clientSearchValue,
                            platformContactUuid: "00000000-0000-0000-0000-000000000000"
                        };
                        phone.push(phoneSearch);
                        break;
                }
                this.clientNameInfo.firstName = firstName;
                this.clientNameInfo.lastName = lastName;
                this.clientNameInfo.email = email;
                this.clientNameInfo.phone = phone;
            }
            this.openAddActionDialog();
        }
    }

    /**
     * @function openActionDialog
     * @description Opens dialog for Add/Edit action.
     */
    openActionDialog() {
        //  if (this.breakPoint.CheckForAccess([SPAScheduleBreakPoint.BookAppointment])) { //TODO add breakpoints
        // this.appointmentservice.fromClientModule = true;
        // this.appointmentservice.labelRecords = [];
        this.guestArray = [];
        for (let i = 0; i < this.selectedClient.length; i++) {
            this.arrayCount = i;
            if (this.selectedClient[i].client.id == 0) {
                this.guestArray.push(this.selectedClient[i]);
            }
        }
        if (this.guestArray.length > 0) {
            // return here
            this.guestNames = this.guestArray.map(x => {
                return x.client.firstName.trim().concat(' ', x.client.lastName.trim());
            }).join(',')
            this.utils.ShowError(this.localization.captions.common.Information, this.localization.replacePlaceholders(this.localization.getError(100002), ["clientName",], [this.guestNames]));
            return;
        }
        this.selectedClient.forEach(element => {
            let clientData: ClientLabel = {
                Id: element.client.id,
                FirstName: element.client.firstName.trim(),
                LastName: element.client.lastName.trim()
            };
            // this.appointmentservice.labelRecords.push(clientData);
        });
        let clientIds: any[] = this.selectedClient.map(x => x.client.id);
        this.getClientsInfo(clientIds);
        //   }
    }


    setSearchText(clientswitchvalue) {
        switch (clientswitchvalue) {
            case clientSearchType.firstName:
                this.searchTextPlaceHolder = this.captions.searchByFirstName;
                break;
            case clientSearchType.lastName:
                this.searchTextPlaceHolder = this.captions.searchByLastName;
                break;
            case clientSearchType.name:
                this.searchTextPlaceHolder = this.captions.searchByFullName;
                break;
            case clientSearchType.phone:
                this.searchTextPlaceHolder = this.captions.searchByPhoneNumber;
                break;
            case clientSearchType.email:
                this.searchTextPlaceHolder = this.captions.searchByEmail;
                break;
            case clientSearchType.patronId:
                this.searchTextPlaceHolder = this.captions.searchByPatronId;
                break;
            default:
                this.searchTextPlaceHolder = this.captions.searchByFirstName;
                break;
        }
    }

    SetclientSearchTypeValue(clientswitchvalue) {
        switch (clientswitchvalue) {
            case clientSearchType.firstName:
                this.clientSearchTypes[0].checked = true;
                this.clientSearchTypes[1].checked = false;
                this.clientSearchTypes[2].checked = false;
                this.clientSearchTypes[3].checked = false;
                this.clientSearchTypes[4].checked = false;
                this.clientSearchTypes[5].checked = false;
                this.selectedClientSearchType = clientSearchType.firstName;
                this.searchTextPlaceHolder = this.captions.searchByFirstName;
                break;
            case clientSearchType.lastName:
                this.clientSearchTypes[0].checked = false;
                this.clientSearchTypes[1].checked = true;
                this.clientSearchTypes[2].checked = false;
                this.clientSearchTypes[3].checked = false;
                this.clientSearchTypes[4].checked = false;
                this.clientSearchTypes[5].checked = false;
                this.selectedClientSearchType = clientSearchType.lastName;
                this.searchTextPlaceHolder = this.captions.searchByLastName;
                break;
            case clientSearchType.name:
                this.clientSearchTypes[0].checked = false;
                this.clientSearchTypes[1].checked = false;
                this.clientSearchTypes[2].checked = true;
                this.clientSearchTypes[3].checked = false;
                this.clientSearchTypes[4].checked = false;
                this.clientSearchTypes[5].checked = false;
                this.selectedClientSearchType = clientSearchType.name;
                this.searchTextPlaceHolder = this.captions.searchByFullName;
                break;
            case clientSearchType.phone:
                this.clientSearchTypes[0].checked = false;
                this.clientSearchTypes[1].checked = false;
                this.clientSearchTypes[2].checked = false;
                this.clientSearchTypes[3].checked = true;
                this.clientSearchTypes[4].checked = false;
                this.clientSearchTypes[5].checked = false;
                this.selectedClientSearchType = clientSearchType.phone;
                this.searchTextPlaceHolder = this.captions.searchByPhoneNumber;
                break;
            case clientSearchType.email:
                this.clientSearchTypes[0].checked = false;
                this.clientSearchTypes[1].checked = false;
                this.clientSearchTypes[2].checked = false;
                this.clientSearchTypes[3].checked = false;
                this.clientSearchTypes[4].checked = true;
                this.clientSearchTypes[5].checked = false;
                this.selectedClientSearchType = clientSearchType.email;
                this.searchTextPlaceHolder = this.captions.searchByEmail;
                break;
            case clientSearchType.patronId:
                this.clientSearchTypes[0].checked = false;
                this.clientSearchTypes[1].checked = false;
                this.clientSearchTypes[2].checked = false;
                this.clientSearchTypes[3].checked = false;
                this.clientSearchTypes[4].checked = false;
                this.clientSearchTypes[5].checked = true;
                this.selectedClientSearchType = clientSearchType.patronId;
                this.searchTextPlaceHolder = this.captions.searchByPatronId;
                break;
            default:
                this.selectedClientSearchType = clientSearchType.firstName;
                this.searchTextPlaceHolder = this.captions.searchByFirstName;
                break;
        }
    }

    openAddActionDialog() {
        const dialogRef = this.dialog.open(ClientPopupComponent, {
            width: '95%',
            height: '85%',
            maxWidth: '95%',
            disableClose: true,
            hasBackdrop: true,
            data: { mode: 'CREATE', title: this.captions.NewClient, type: this.captions.save, data: '', closebool: true, clientInfo: this.clientNameInfo },
            panelClass: 'small-popup'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (this.clientService.selectedIndex == 1) {
                this.RecentClientInformation(this.searchText, this.selectedClientSearchType);
            } else {
                this.searchdata(this.searchText);
            }
        })
    }


    openClientEditActionDialog() {
        // this.appointmentservice.addFromClientModule = true;
        // this.dialog.open(AppointmentPopupComponent, {
        //     width: '95%',
        //     height: '85%',
        //     disableClose: true,
        //     hasBackdrop: true,
        //     data: { data: '', closebool: true },
        //     panelClass: 'small-popup'
        // });
    }

    openEditDialog(id: any, clientDetail) {
        const dialogRef = this.dialog.open(ClientPopupComponent, {
            width: '95%',
            height: '85%',
            disableClose: true,
            hasBackdrop: true,
            data: {
                mode: 'EDIT',
                title: this.isCopyClient ? this.captions.NewClient : this.captions.EditClient,
                type: this.isCopyClient ? this.captions.save : this.captions.Update,
                id: id,
                data: clientDetail,
                closebool: true,
                isClientViewOnly: this.isClientViewOnly,
                isCopyClient: this.isCopyClient
            },
            panelClass: 'small-popup'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.length && result[0] == 'ReloadClient') {
                this.getClientDataByGuid(result[1]);
                return;
            }
            this.isAddAppointment = false;
            this.singleUserView = false;
            if (this.clientService.selectedIndex == 1) {
                this.RecentClientInformation(this.searchText, this.selectedClientSearchType);
            } else {
                this.searchdata(this.searchText);
            }
        })
    }

    clientSearchTypeChange(id) {
        this.clearSearchTextValue();
        this.SetclientSearchTypeValue(id);
        this.selectedClientSearchType = id;
        this.enableSearch = false;
    }

    clearSearchTextValue() {
        this.searchText = '';
    }

    getClientsInfo(id: any) {
        let keyValue: KeyValuePair = { key: 'id', value: id };
        this.http.CallApiWithCallback<number>({
            host: Host.retailPOS,
            success: this.successCallback.bind(this),
            error: this.errorCallback.bind(this),
            callDesc: "GetClients",
            method: HttpMethod.Get,
            queryString: keyValue,
            showError: true,
            extraParams: []
        });
    }

    getClientsInfoByGuestIds(guestIds: any[]) {
        //let keyValue: KeyValuePair = { key: 'id', value: id };
        this.http.CallApiWithCallback<number>({
            host: Host.retailPOS,
            success: this.successCallback.bind(this),
            error: this.errorCallback.bind(this),
            callDesc: "GetClientsByGuestIds",
            method: HttpMethod.Put,
            body: guestIds,
            showError: true,
            extraParams: []
        });
    }

    getClientDataByGuid(guestId: any) {
        this.http.CallApiWithCallback({
            host: Host.retailPOS,
            success: this.successCallback.bind(this),
            error: this.errorCallback.bind(this),
            callDesc: "getClientInfoByGuid",
            method: HttpMethod.Get,
            showError: true,
            uriParams: { guid: guestId },
            extraParams: ['FromClientSearch']
        });
    }
    getPlatformGuestData(platformGuestId : any){
        this.http.CallApiWithCallback({
          host: Host.retailPOS,
          success: this.successCallback.bind(this),
          error: this.errorCallback.bind(this),
            callDesc: "GetClientByPlatformGuestUuid",
          method: HttpMethod.Get,
          showError: true,
          uriParams: { platformGuid: platformGuestId },
          extraParams: []
        });
      }

    getClientData(clientId: number) {
        this.http.CallApiWithCallback({
            host: Host.retailPOS,
            success: this.successCallback.bind(this),
            error: this.errorCallback.bind(this),
            callDesc: "getClientInfo",
            method: HttpMethod.Get,
            showError: true,
            uriParams: { id: clientId },
            extraParams: []
        });
    }


    // Table Events
    clientSelected(clientRowData) {
        this.enableStickyColumn = false;
        this.userData = clientRowData;
        this.singleUserView = true;
        // this.getRecentAppointments(clientRowData.client.id);
        this.selectedClient = [];
        this.isAddAppointment = false;
    }

    /**
     * @function EditRecords
     * @description Edit client listener.
     */
    async EditRecords(event) {
        // To Do: Edit Client Info mapping.
        let response = event[2] == 'edit' ? await this.userAccessBusiness.getUserAccess(BreakPoint.EditClientProfile) :
            await this.userAccessBusiness.getUserAccess(BreakPoint.CopyClientProfile);
        this.isClientViewOnly = response.isViewOnly;
        let platformGuestId;
        if (response.isAllow || response.isViewOnly) {
            if (event.length > 0) {
                this.guestId = event[0].client.guestId;
                platformGuestId = event[0].client.platformGuestUuid
                this.isCopyClient = event[2] == 'copy';
            }
            else {
                this.guestId = event.client.guestId;
                platformGuestId = event.client.platformGuestUuid
            }
            if ((this.guestId == '' || this.guestId == DefaultGUID) && platformGuestId && platformGuestId != '' && platformGuestId != DefaultGUID) {
                this.getPlatformGuestData(platformGuestId);
            } else {
                this.getClientDataByGuid(this.guestId); 
            }
        }
    }

    clientSearch(searchText) {
        this.requestUid = Date.now() + "" + this.utils.getRandomDecimal() * 10000;
        if (this.timer) {
            clearTimeout(this.timer); //cancel the previous timer.
            this.timer = null;
        }
        this.timer = setTimeout(this.searchdata.bind(this), 1000, searchText);
    }

    enableSearchButton() {
        if (this.searchText.length > 2 || (this.searchText.length > 0 && this.selectedClientSearchType == clientSearchType.patronId)) {
            this.enableSearch = true;
        }
        else {
            this.enableSearch = false;
        }

    }

    onEnter() {
        if (this.searchText.length > 2 || (this.searchText.length > 0 && this.selectedClientSearchType == clientSearchType.patronId)) {
            this.clientSearch(this.searchText)
        }
    }

    searchdata(searchText) {
        if (this.searchText.trim() == '' && this.guestNameFromGlobalSearch.trim() != '') {
            this.SearchClientInformation(this.guestNameFromGlobalSearch.trim(), false, this.guidFromGlobalSearch, this.selectedClientSearchType);
            this.singleUserView = false;
        }
        else {
            if ((searchText.length == 0 || searchText.length > 2 || (this.searchText.length > 0 && this.selectedClientSearchType == clientSearchType.patronId)) && this.clientService.selectedIndex == 1) {
                this.RecentClientInformation(this.searchText, this.selectedClientSearchType);
                this.singleUserView = false;
            }
            else if ((searchText.length > 2 && this.clientService.selectedIndex != 1) || (this.searchText.length > 0 && this.selectedClientSearchType == clientSearchType.patronId)) {
                this.SearchClientInformation(this.searchText, this.clientService.isVip, undefined, this.selectedClientSearchType);
                this.singleUserView = false;
            }
            else {
                this.formattedData = [];
                this.sampleData = [];
                this.BindGrid();
                this.FilterClientInformation();
                this.refreshData();
                this.singleUserView = false;
            }
        }
    }

    clearText() {
        this.searchText = '';
        this.enableSearch = false;
    }
    BindGrid() {
        this.formattedData = this.formatTableData(this.formattedData);
        this.tableoptions = [{
            TableHdrData: [
                {
                    title: this.captions.BasicInformation, jsonkey: 'client', alignType: 'left',
                    datatype: 'client', searchable: true, sortable: true
                },
                { title: this.captions.PatronID, jsonkey: 'patronId', alignType: 'left', searchable: true, sortable: true },
                { title: this.captions.Gender, jsonkey: 'gender', alignType: 'left', datatype: 'icon', searchable: false, sortable: false },
                { title: this.captions.DateOfBirth, jsonkey: 'dateOfBirth', alignType: 'left', searchable: false, sortable: true },
                { title: this.captions.Address, jsonkey: 'address', alignType: 'left', searchable: false, sortable: false },
                {
                    title: this.captions.PhoneNumber, jsonkey: 'phoneNumber', alignType: 'left',
                    searchable: true, sortable: false, hover: 'phoneNumbers'
                },
            ],
            TablebodyData: this.formattedData,
            ServiceId: 99,
            sortable: true,
            CustomColumn: true,
            TableSearchText: this.searchText,
            PlaceHoldertext: 'search by',
            EnableActions: true,
            SelectedSettingId: 99,
            Sortable: this.clientService.selectedIndex != 1 ? 'client' : '',
            SelectRows: false,
            Searchable: false,
            EditMoreOption: true,
            disableDelete: true
        }];
    }

    ngAfterViewChecked() {
        if (!this.viewCheckedFlag) {
            this.viewCheckedFlag = true;
            setTimeout(() => {
                this.calculatewidth();
            }, 1);
        }
    }

    calculatewidth() {
        let searchClass = document.getElementsByClassName('page-header');
        for (let i = 0; i < searchClass.length; i++) {
            let pageHeader = document.getElementsByClassName('page-header'[0]) ? document.getElementsByClassName('page-header')[0]['offsetWidth'] : 0;
            let searchInput = searchClass[i].getElementsByClassName('searchpt')[0];
            // console.log(searchInput);
            if (pageHeader > 0) {
                pageHeader = pageHeader - this.setMatformWidth(searchClass[i]) - 60;
            }
            let inputLength = this.tableInput ? this.tableInput.nativeElement.getAttribute('data-placeholder').length : 1;
            let inputWidth = inputLength <= 30 ? inputLength * 13 : inputLength * 7.5 + 20;
            if (searchInput && pageHeader > 0) {
                searchInput['style'].width = (pageHeader > inputWidth) ? inputWidth + 'px' : pageHeader + 'px';
            }
        }
    }

    setMatformWidth(myElement) {
        if (this.tableInput) {
            let minWidth = myElement.parentElement.parentElement.getElementsByClassName('clientappointmentactions')[0] ? myElement.parentElement.parentElement.getElementsByClassName('clientappointmentactions')[0]['offsetWidth'] : 300; //min-300 max-470
            return minWidth;
        }
    }

    selectFilter(data, value, from) {
        let actualArrayValues = this.innerfilterArray.filter(x => x.name == data.name);
        let index = this.selectedArray.findIndex(x => x.name == data.name);
        if (from == 'name') {
            this.innerfilterArray.forEach(element => {
                element.values.forEach(dataSet => {
                    if (dataSet.id == value.id && element.name.toLowerCase() == data.name.toLowerCase())
                        dataSet.checked = !dataSet.checked;
                });
            });
        }

        if (value.id == 0) {
            if (value.checked) {
                let changedArray = actualArrayValues[0].values.forEach(e => e.checked = true);
                this.selectedArray[index].values = actualArrayValues[0].values;
                this.innerfilterArray[index].selected = actualArrayValues[0].values.length - 1;
            }
            else {
                let changedArray = actualArrayValues[0].values.forEach(e => e.checked = false);
                this.selectedArray[index].values = [];
                this.innerfilterArray[index].selected = 0;
            }
        }
        else {
            let valueIndex = this.selectedArray[index].values.findIndex(x => x.id == value.id);
            if (valueIndex < 0) {
                this.selectedArray[index].values.push(value);
                let dataIndex = this.selectedArray[index].values.findIndex(x => x.id == 0);
                if (dataIndex < 0 && (this.selectedArray[index].values.length == actualArrayValues[0].values.length - 1)) {
                    this.innerfilterArray.forEach(element => {
                        element.values.forEach(dataSet => {
                            if (dataSet.id == 0 && element.name.toLowerCase() == data.name.toLowerCase())
                                dataSet.checked = true;
                        });
                    });
                }
            }
            else {
                this.selectedArray[index].values = this.selectedArray[index].values.filter(x => x.value.toLowerCase() != value.value.toLowerCase());
                this.selectedArray[index].values = this.selectedArray[index].values.filter(x => x.id != 0 && x.jsonkey == value.jsonkey);
                this.innerfilterArray.forEach(element => {
                    element.values.forEach(dataSet => {
                        if (dataSet.id == 0 && element.name.toLowerCase() == data.name.toLowerCase())
                            dataSet.checked = false;
                    });
                });
            }
            this.innerfilterArray[index].selected = this.selectedArray[index].values.length;
        }
        this.formattedData = [];
        let cityArray = _.map(this.selectedArray[1].values, 'value');
        let genderArray: any = [];
        //let genderArray = _.map(this.selectedArray[0].values, 'value');
        if (this.innerfilterArray[0].values.find(a => a.id == 1 && a.checked)) {
            genderArray.push('Female')
        }
        if (this.innerfilterArray[0].values.find(a => a.id == 2 && a.checked)) {
            genderArray.push('Male')
        }
        if (this.innerfilterArray[1].values.find(a => a.id == 0 && a.checked)) {
            cityArray.push('');
        }
        this.formattedData = _.filter(this.sampleData, ({ gender, city }) => _.every([
            genderArray.length > 0 ? _.includes(genderArray, gender) : true,
            cityArray.length > 0 ? _.includes(cityArray, city) : true]));
        this.BindGrid();
    }

    refreshData() {
        this.innerfilterArray.forEach(element => {
            element.selected = 0;
            element.values.forEach(data => {
                data.checked = false;
            });
        });
        this.selectedArray.forEach(element => {
            element.values = [];
        })
        this.formattedData = [];
        this.formattedData = this.formattedData.concat(this.sampleData);
        this.BindGrid();
    }
    sliderclose(event) {

        document.getElementsByClassName("highlight")[0].classList.remove("highlight");
        this.singleUserView = event;
        // setTimeout(() => this.enableStickyColumn = true, 500);

    }

    formatTableData(tableData) {
        this.formattedData = tableData.map(data => { data.address = ((data.line1 != '' ? data.line1 + ', ' : '') + (data.city != '' ? data.city + ', ' : '') + (data.state != '' ? data.state + ', ' : '') + (data.country != '' ? data.country + ', ' : '') + (data.zip ? + data.zip : '')); return data; });
        return this.formattedData;
    }

    RowSelected(event) {
        this.singleUserView = false;
        this.selectedClient = event;
        if (this.selectedClient.length > 0) {
            this.isAddAppointment = true;
        } else {
            this.isAddAppointment = false;
        }
    }

    setFilterPopover(evt) {
        let posX = evt.target.parentElement.parentElement.offsetLeft;
        let posY = evt.target.parentElement.parentElement.offsetTop;
        this.left = posX;
        this.top = posY;
    }

    SearchClientInformation(pattern: any, isVip: any, clientGuid: any = "0", searchType: any) {
        this.http.CallApiWithCallback<number>({
            host: Host.retailPOS,
            success: this.successCallback.bind(this),
            error: this.errorCallback.bind(this),
            callDesc: "SearchClientInfo",
            method: HttpMethod.Put,
            uriParams: { searchType:searchType, requestUid: (this.requestUid || Date.now() + "" + this.utils.getRandomDecimal() * 10000), isPlatformGuestSearch: this.isPlatformGuestSearch },
            body: pattern,
            showError: true,
            extraParams: []
        });
    }

    RecentClientInformation(searchText: any, searchType: any) {
        if (this.requestUid == '') {
            this.requestUid = Date.now() + "" + this.utils.getRandomDecimal() * 10000;
        }
        this.http.CallApiWithCallback<number>({
            host: Host.retailPOS,
            success: this.successCallback.bind(this),
            error: this.errorCallback.bind(this),
            callDesc: "RecentClientInfo",
            method: HttpMethod.Put,
            body: searchText,
            uriParams: { propertyDate: this.utils.convertDateFormat(this.PropertyInfo.CurrentDate), searchType: searchType, requestUid: this.requestUid },
            showError: true,
            extraParams: []
        });
    }

    FilterClientInformation() {
        let finalArrGender: any = {};
        finalArrGender = {
            "name": this.captions.Gender,
            "values": [
                {
                    "id": 2,
                    "value": this.captions.Male,
                    "checked": false,
                    "jsonkey": "gender"
                },
                {
                    "id": 1,
                    "value": this.captions.Female,
                    "checked": false,
                    "jsonkey": "gender"
                },
                {
                    "id": 0,
                    "value": this.captions.All,
                    "checked": false,
                    "jsonkey": "gender"
                }]
        };
        let finalArrCity: any = {};
        finalArrCity["name"] = this.captions.City;
        finalArrCity["values"] = [];
        if (this.formattedData.length > 0) {
            this.filteredCity = this.formattedData.map(x => x.city);
            this.filteredCity = this.utils.removeDuplicates(this.filteredCity);
            this.filteredCity = this.filteredCity.filter(c => c != "");
            this.filteredCity.forEach((element, Index) => {
                finalArrCity.values.push(
                    {
                        "id": Index + 1,
                        "value": element,
                        "checked": false,
                        "jsonkey": "city"
                    })
            });
            if (finalArrCity.values.length > 1) {
                finalArrCity.values.push(
                    {
                        "id": 0,
                        "value": this.captions.All,
                        "checked": false,
                        "jsonkey": "city"
                    }
                )
            }
        }
        this.innerfilterArray = [];
        this.innerfilterArray.push(finalArrGender);
        this.innerfilterArray.push(finalArrCity);
        this.innerfilterArray.forEach(element => {
            element.selected = 0;
        });
        this.selectedArray = _.cloneDeep(this.innerfilterArray);
        this.sampleData = _.cloneDeep(this.formattedData);
    }

    CreateClientByGuid(clientInfo: any) {
        this.http.CallApiWithCallback({
            host: Host.retailPOS,
            success: this.successCallback.bind(this),
            error: this.errorCallback.bind(this),
            callDesc: "createClientByGuestId",
            method: HttpMethod.Put,
            body: clientInfo,
            showError: true,
            uriParams: { guid: clientInfo.clientDetail.guestId },
            extraParams: ['FromClientSearch']
        });
    }

    async successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]) {
        if (callDesc == "SearchClientInfo" || callDesc == "RecentClientInfo") {
            this.formattedData = <any>result.result;
            let imageRefIds = this.formattedData.map(p => p.guestId).filter(x => x != null && x != DefaultGUID);
            if (imageRefIds.length > 0) {
                this.imageList = await this._imageService.getImagesForClients(imageRefIds, false);
            }
            var responseUid = "";
            if (this.formattedData != null) {
                for (let i = 0; i < this.formattedData.length; i++) {
                    responseUid = this.formattedData[i].requestUid;
                    if (((this.requestUid != "" && responseUid != "" && this.requestUid == responseUid) || (this.requestUid == "" || responseUid == "")) == false) {
                        return;
                    }
                }
            }

            this.clientData = [];
            if (this.formattedData != null) {
                for (let i = 0; i < this.formattedData.length; i++) {
                    let emails, phones;
                    const client: any = [];
                    if (this.formattedData[i].phoneNumbers && this.formattedData[i].phoneNumbers.length > 0) {
                        phones = this.formattedData[i].phoneNumbers.map(element => { return element.number });

                        let primaryPhone = this.formattedData[i].phoneNumbers.find(x => x.isPrimary);
                        this.formattedPhoneNo = [];
                        this.formattedPhoneNos = [];
                        let PhnoExt = [];
                        if (primaryPhone) {
                            //ADDING FOR EXTENSION FIELD
                            this.formattedPhoneNo = this.utils.getFormattedPhNo(primaryPhone);
                            this.formattedPhoneNos = this.formattedPhoneNo;
                        }
                        else {
                            let firstPhone = this.formattedData[i].phoneNumbers[0];
                            this.formattedPhoneNo = this.utils.getFormattedPhNo(firstPhone);
                            this.formattedPhoneNos = this.formattedData[i].phoneNumbers.map(x => {
                                //ADDING FOR EXTENSION FIELD
                                let number = this.utils.getFormattedPhNo(x);
                                return number;
                            }).join(' | ')
                        }
                    }
                    if (this.formattedData[i].emails && this.formattedData[i].emails.length > 0) {
                        emails = this.formattedData[i].emails.map(element => { return element.emailId });

                        let primaryEmail = this.formattedData[i].emails.find(x => x.isPrimary);
                        this.formattedEmail = [];
                        this.formattedEmails = [];
                        if (primaryEmail) {
                            this.formattedEmail = primaryEmail.emailId;
                            this.formattedEmails = this.formattedEmail;
                        }
                        else {
                            this.formattedEmail = this.formattedData[i].emails[0].emailId;
                            this.formattedEmails = this.formattedData[i].emails.map(x => {
                                return x.emailId;
                            }).join(' | ')
                        }
                    }
                    let img = this.imageList ? this.imageList.find((image) => this.formattedData[i].guestId &&
                        (image.imageReferenceId.toLocaleLowerCase() === this.formattedData[i].guestId.toLocaleLowerCase())) : '';

                    client.push({
                        id: this.formattedData[i].id,
                        guestId: this.formattedData[i].guestId,
                        firstName: this.formattedData[i].firstName,
                        lastName: this.formattedData[i].lastName,
                        name: this.formattedData[i].firstName + " " + this.formattedData[i].lastName,
                        email: this.formattedData[i].emails && this.formattedData[i].emails.length > 0 ? this.formattedEmail : '',
                        emails: this.formattedData[i].emails && this.formattedData[i].emails.length > 0 ? this.formattedEmails : '',
                        image: img ? img : null,
                        vip: this.formattedData[i].vip,
                        platformBussinessCardRevUuid: this.formattedData[i].platformBussinessCardRevUuid,
                        platformBussinessCardUuid: this.formattedData[i].platformBussinessCardUuid,
                        platformGuestUuid: this.formattedData[i].platformGuestUuid,
                        platformRevUuid: this.formattedData[i].platformRevUuid
                    }),
                        this.clientData.push({
                            client: client[0],
                            dateOfBirth: this.formattedData[i].dateOfBirth && this.formattedData[i].dateOfBirth != null ? new Date(this.formattedData[i].dateOfBirth) : '',
                            gender: this.formattedData[i].gender,
                            age: this.formattedData[i].dateOfBirth && this.formattedData[i].dateOfBirth != null ? this.utils.getAge(this.utils.getDate(this.localization.LocalizeDate(this.formattedData[i].dateOfBirth))) : '',
                            phoneNumber: this.formattedData[i].phoneNumbers && this.formattedData[i].phoneNumbers.length > 0 ? this.formattedPhoneNo : '',
                            phoneNumbers: this.formattedData[i].phoneNumbers && this.formattedData[i].phoneNumbers.length > 0 ? this.formattedPhoneNos : '',
                            line1: this.formattedData[i].addresses && this.formattedData[i].addresses != null ? this.formattedData[i].addresses.addressLine1 : '',
                            line2: this.formattedData[i].addresses && this.formattedData[i].addresses != null ? this.formattedData[i].addresses.addressLine2 : '',
                            city: this.formattedData[i].addresses && this.formattedData[i].addresses != null ? this.formattedData[i].addresses.city : '',
                            state: this.formattedData[i].addresses && this.formattedData[i].addresses != null ? this.formattedData[i].addresses.state : '',
                            country: this.formattedData[i].addresses && this.formattedData[i].addresses != null ? this.formattedData[i].addresses.country : '',
                            zip: this.formattedData[i].addresses && this.formattedData[i].addresses != null ? this.formattedData[i].addresses.zip : '',
                            patronId: this.formattedData[i].loyaltyDetail && this.formattedData[i].loyaltyDetail[0] ?
                                this.formattedData[i].loyaltyDetail[0].patronId : ''
                        });
                }
            }
            this.formattedData = this.clientData;
            this.BindGrid();
            this.FilterClientInformation();
            this.refreshData();
            if (this.searchText.trim() == '' && this.guestNameFromGlobalSearch.trim() != '') {
                //Do Nothing
            }
            else if (this.searchText.length == 0 && this.clientService.selectedIndex == 1) {
                //Do Nothing
            }
            else if (this.searchText.length < 3 && !this._as.isglobalSearch) {
                this.formattedData = [];
                this.sampleData = [];
                this.BindGrid();
                this.FilterClientInformation();
                this.refreshData();
                this.singleUserView = false;
            }
            if (this._as.isglobalSearch) {
                this._as.isglobalSearch = false;
            }
        }
        else if (callDesc == "GetClients") {
            let clientData = <any>result.result;
            // this.appointmentservice.fromClientModule = true;
            this.guestArray = [];
            for (let i = 0; i < clientData.length; i++) {
                let isAllMandatoryFieldsFilled = await this.clientService.MandatoryFieldsValidation(clientData[i]);
                if (!isAllMandatoryFieldsFilled) {
                    this.guestArray.push(clientData[i].clientDetail);
                }
            }
            if (this.guestArray.length > 0) {
                // return here
                this.guestNames = this.guestArray.map(x => {
                    return x.firstName.trim().concat(' ', x.lastName.trim());
                }).join(',')
                this.utils.ShowError(this.localization.captions.common.Information, this.localization.replacePlaceholders(this.localization.getError(100004), ["clientName",], [this.guestNames]));
                return;
            }
        }
        else if (callDesc == "getClientInfo" || callDesc == "createClientByGuestId") {
            let clientDetail = <any>result.result;
            // this.appointmentservice.add_client = false;
            // this.appointmentservice.clientEditData = clientDetail;
            // this.appointmentservice.clientId = clientDetail.clientDetail.id;
            // this.appointmentservice.guestId = clientDetail.clientDetail.guestId;
            // this.imageprocessorservice.GetImagesByReference(this.appointmentservice.guestId, GlobalConst.ImgRefType.client, this.successCallback.bind(this), this.errorCallback.bind(this), [], true);
            // this.openEditDialog(this.appointmentservice.clientId, clientDetail);
        }
        else if (callDesc == "getClientInfoByGuid" || callDesc == "GetClientByPlatformGuestUuid") {
            let clientInfo = <any>result.result;
            this.openEditDialog(clientInfo.client.id, clientInfo);
            // this.CreateClientByGuid(clientInfo);
        } else if (callDesc === "v2GetImagesByReferenceId") {
            let response = <any>result.result
            if (response && response.length > 0) {
                response.forEach((img) => {
                    //   if (!this.appointmentservice.imageArray.find(x => x['imageReferenceId'] === img.imageReferenceId)) {
                    //       this.appointmentservice.clientImageChange(response);
                    //   }
                })
            }

        }
    }
    errorCallback<T>(error: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    }

    isPlatformGuestSearchChanged(e){
        this.isPlatformGuestSearch = Boolean(e[0]);
    }
    async setPlatformGuestSearch()
    {
        let platformGuestSearch = await this.propertySettingService.GetEnableExtendedProfileSearchByDefaultSetting();
        this.isPlatformGuestSearch = platformGuestSearch && platformGuestSearch.value.toString().toLowerCase() === 'true' ? true : false;
        this.ClientSearchForm.setValue({
            platformGuestSearch: this.isPlatformGuestSearch
        });
    }
}
