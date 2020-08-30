import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Localization } from '../../../../core/localization/Localization';
import { SubscriptionLike as ISubscription, ReplaySubject } from 'rxjs';
// import { AppointmentpopupService } from '../../../../shared/service/appointmentpopup.service';
import { MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { ClientCommonService } from 'src/app/client/client.service';
import { Utilities } from 'src/app/common/shared/shared/utilities/utilities';


@Component({
  selector: 'app-single-user-view',
  templateUrl: './single-user-view.component.html',
  styleUrls: ['./single-user-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingleUserViewComponent implements OnInit, OnDestroy {
  captions: any;
  //userSubscription: ISubscription;

  ServiceId: 1;
  @Input() Appointments;

  @Input() userData;
  @Input() showUser;
  @Output() editclient: EventEmitter<any> = new EventEmitter();
  @Output() sliderclose: EventEmitter<any> = new EventEmitter();
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  nsBDRclr: string;
  closeBDRclr: string;
  checkinBDRclr: string;
  checkoutBDRclr: string;
  sBDRclr: string;
  constructor(public localization: Localization, private propertyInfo: PropertyInformation, private utils: Utilities, private clientCommonService: ClientCommonService) { }

  trackByFn(index, cell) {
    return index;
  }

  ngOnInit() {
    this.captions = this.localization.captions;
    // this.propertyInfo._appointmentConfigurations$.pipe(takeUntil(this.destroyed$)).subscribe(result => {
    //   if (result) {
    //     this.setStatusColors();
    //   }
    // });
  }

  setStatusColors() {
    this.nsBDRclr = this.utils.getBorderColor('NOSHOW');
    this.closeBDRclr = this.utils.getBorderColor('CLOSED');
    this.checkinBDRclr = this.utils.getBorderColor('CKIN');
    this.checkoutBDRclr = this.utils.getBorderColor('CKOUT');
    this.sBDRclr = this.utils.getBorderColor('RESV');
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  sliderClose(event) {
    // this._cs.singleUserView.next(false);
    this.sliderclose.emit(!this.showUser);

  }

  EditRecords(event, data, type, id) {
    this.editclient.emit(data);
  }

  playerWorthDetails() {
    this.clientCommonService.openDialogPopup(this.userData.patronId);
  }
}
