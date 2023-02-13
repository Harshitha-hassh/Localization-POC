import { Injectable } from '@angular/core';
import { PendingAction, GridAction } from './AuditModals';
import { RetailLocalization } from '../retail/common/localization/retail-localization';


@Injectable()
export class AuditService {

    captions: any;
    constructor(public localization: RetailLocalization) {
        this.captions = this.localization.captions.dayEnd;
    };


    public GetDayEndGridHeader(option: PendingAction): any {
        let header: any = [];
        switch (option) {
            case PendingAction.CheckedInAppointment:
            case PendingAction.ScheduledWithDeposit:
            case PendingAction.CheckOutWithoutTransaction: {
                header = [{ "title": this.captions.Name, "jsonkey": "GuestName", "alignType": "left" },
                { "title": this.captions.Service, "jsonkey": "Service", "alignType": "left" },
                { "title": this.captions.Package, "jsonkey": "Package", "alignType": "left" },
                { "title": this.captions.Staff, "jsonkey": "Staff", "alignType": "left" },
                { "title": this.captions.AppointmentTime, "jsonkey": "Appointmenttime", "alignType": "left" },
                { "title": this.captions.Location, "jsonkey": "Location", "alignType": "left" },
                { "title": this.captions.Status, "jsonkey": "Status", "alignType": "left" },
                { "title": this.captions.AppointmentID, "jsonkey": "AppointmentId", "alignType": "right" }];
            }
                break;
            case PendingAction.OpenTransaction: {
                header = [{ "title": this.captions.TicketNumber, "jsonkey": "TicketNumber", "alignType": "left" },
                { "title": this.captions.TransactionType, "jsonkey": "retailTransactionType", "alignType": "left" },
                { "title": this.captions.Date, "jsonkey": "Date", "alignType": "left" },
                { "title": this.captions.ClerkID, "jsonkey": "ClerkID", "alignType": "right" },
                { "title": this.captions.Outlet, "jsonkey": "Outlet", "alignType": "left" },
                { "title": `${this.captions.Amount} (${this.localization.currencySymbol})`, "jsonkey": "Amount", "alignType": "right" },
                { "title": this.captions.ClientName, "jsonkey": "ClientName", "alignType": "left" },
                { "title": this.captions.MemberName, "jsonkey": "MemberName", "alignType": "left" },
                { "title": `${this.captions.PaymentReceived} (${this.localization.currencySymbol})`, "jsonkey": "paymentReceivedAmount", "alignType": "right" },
                { "title": this.captions.Actions, "jsonkey": "Actions", "alignType": "left" },
                ];
            }
                break;
        }
        return header;
    }

    public GetDayEndGridAction(option: PendingAction): any {
        let actions: any = [];
        switch (option) {
            case PendingAction.ScheduledWithDeposit:
                actions = [{ 'label': this.captions.CheckInCheckOut, 'action': GridAction.CheckInCheckOut, 'redirectTo': '' }, { 'label': this.captions.Move, 'action': GridAction.Move, 'redirectTo': '' }]
                break;
            case PendingAction.CheckedInAppointment:
                actions = [{ 'label': this.captions.CheckOut, 'action': GridAction.CheckOut, 'redirectTo': '' }, { 'label': this.captions.UndoCheckIn, 'action': GridAction.UndoCheckIn, 'redirectTo': '' }]
                break;
            case PendingAction.CheckOutWithoutTransaction:
                actions = [{ 'label': this.captions.UndoCheckOut, 'action': GridAction.UndoCheckOut, 'redirectTo': '' }];
                break;
             case PendingAction.OpenTransaction:
                actions = [{ 'label': this.captions.Settle, 'action': GridAction.Settle, 'redirectTo': '' }, { 'label': this.captions.Open, 'action': GridAction.ReOpen, 'redirectTo': '' }
                ,{ 'label': this.captions.Cancel, 'action': GridAction.CancelTransaction, 'redirectTo': '' },{ 'label': this.localization.captions.shop.Close, 'action': GridAction.Close, 'redirectTo': '' }]
                break;
        }
        return actions;
    }
}