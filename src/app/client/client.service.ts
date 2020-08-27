import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Localization } from 'src/app/core/localization/Localization';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonAlertMessagePopupComponent } from '../common/shared/shared/alert-message-popup/alert-message-popup.component';

@Injectable({providedIn: 'root'})
export class ClientCommonService {
  captions: any;
  commonCaptions: any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(private dialog: MatDialog,
    public localization: Localization) {
    this.captions = this.localization.captions.bookAppointment;
    this.commonCaptions = this.localization.captions.common;
  }

  openDialogPopup(data) {
    let dialogRef = this.dialog.open(CommonAlertMessagePopupComponent, {
      width: '350px',
      maxWidth: '1000px',
      height: '272px',
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'action-dialog-overlay',
      data: { headername: this.captions.PlayerWorthDetails, closebool: true, type: 'PW', datarecord: data, buttonName: this.commonCaptions.OK },
  });
  dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(res => {

  });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
