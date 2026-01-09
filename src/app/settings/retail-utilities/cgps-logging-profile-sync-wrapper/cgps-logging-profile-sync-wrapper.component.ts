import { Component, OnInit } from '@angular/core';
import { TableHeaderOptions } from 'src/app/common/Models/ag-models';
import { ActionMode } from 'src/app/common/enums/shared-enums';
import { Localization } from 'src/app/common/localization/localization';
import { AlertType, ButtonType } from 'src/app/shared/shared-models';
import { CgpsLoggingProfileSyncWrapperBusiness } from './cgps-logging-profile-sync-wrapper.business';
import { CommonUtilities } from 'src/app/common/shared/shared/utilities/common-utilities';
import { ActivatedRoute, Router } from '@angular/router';
import { CgpsLoggingProfileSyncWrapperDataService } from 'src/app/shared/data-services/cgps-logging-profile-sync-wrapper.data.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientPopupComponent } from 'src/app/client/client-popup/client-popup.component';
import { TableGridOptions } from './cgps-logging-profile-sync-wrapper.model';

@Component({
  standalone: false,
  selector: 'app-cgps-logging-profile-sync-wrapper',
  templateUrl: './cgps-logging-profile-sync-wrapper.component.html',
  styleUrls: ['./cgps-logging-profile-sync-wrapper.component.scss'],
  providers:[CgpsLoggingProfileSyncWrapperBusiness, CgpsLoggingProfileSyncWrapperDataService]
})
export class CgpsLoggingProfileSyncWrapperComponent implements OnInit {

  searchHeaderOption: { searchPlaceHolder: string; createBtnLabel: string; };
  tableOptions: TableGridOptions;
  isViewOnly: any;
  headerOptions : TableHeaderOptions[];
  captions: any;
  tableContent : any;
  originalData: any;
  newGuestToggle : boolean = false;
  routerState: any;
  
  

  constructor(private localization:Localization
    ,private _business : CgpsLoggingProfileSyncWrapperBusiness
    ,private utilities: CommonUtilities
    ,private route: ActivatedRoute
    ,private dialog: MatDialog
    ,private router: Router) 
    {
       this.captions=this.localization.captions;
       const currentNavigation = this.router.getCurrentNavigation();
       this.routerState = currentNavigation ? currentNavigation.extras.state : null;
    }

  ngOnInit(): void {
    this.searchHeaderOption = {
      searchPlaceHolder: this.captions.lbl_SearchCGPS,
      createBtnLabel: this.captions.lbl_Sync,
    }
    this.tableOptions = this._business.getTableOptions();
    this.headerOptions =  this._business.getHeaderOptions();    
  }

  ngAfterViewInit()
  {
    this.utilities.ToggleLoader(true);
    this.getTableData();
   }

  getTableData()
  {
    this._business.GetFailedProfile().then(value => {      
      this.tableContent = value;
    });
    this.utilities.ToggleLoader(false);
  }

  saveEmitValue(eve) {
    let result = this._business.DateRangeProfileSync(eve.startDate,eve.endDate);
    if (result) {
      this.utilities.showAlert(this.captions.lbl_processInitiated, AlertType.Info, ButtonType.Ok);
    }
  }

  tableAction(event) {
    let result = this._business.singleProfileSync(event.Obj.guestId,event.Obj.syncDirection);
    if (result) {
      this.utilities.showAlert(this.captions.lbl_processInitiated, AlertType.Info, ButtonType.Ok);
    }
  }

  async EditEvent(event)
  {
    
    if(event)
    {
      let clientInfo = await this._business.getClientInfoByGuid(event.guestId);
      this.openEditDialog(clientInfo.client.id, clientInfo);
    }
  }

  openEditDialog(id: any, clientDetail) {
    const dialogRef = this.dialog.open(ClientPopupComponent, {
        width: '95%',
        height: '85%',
        disableClose: true,
        hasBackdrop: true,
        data: {
            mode: 'EDIT', title: this.captions.EditClient, type: this.captions.Update, id: id,
            data: clientDetail, closebool: true, isClientViewOnly: this.isViewOnly
        },
        panelClass: 'small-popup'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.utilities.ToggleLoader(true);
      this.getTableData();
    });
}

  onClickAction(event) {
    if(event.guestSummary)
    {
      this.utilities.showAlert(this.captions.successfullysaved, AlertType.Info, ButtonType.Ok);
    }
    switch (event.from) {
      case ActionMode.cancel:
        this.onBack();
        break;
      case ActionMode.create:
        this.onBack();
        break;
      case ActionMode.update:
        this.onBack();
        break;
    }
  }

  onBack() {
    this.newGuestToggle = false;
    if (this.routerState) {
      if (this.routerState.loadGuest) {
        this.router.navigateByUrl(this.routerState.returnUrl, {
          state: { data: this.routerState.stateData }
        });
      }
    }
  }


}
