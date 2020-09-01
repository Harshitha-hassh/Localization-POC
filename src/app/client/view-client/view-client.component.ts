import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup, MatTabChangeEvent } from '@angular/material';
import { ClientService } from '../../shared/service/client-service.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';

@Component({
  selector: 'view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss']
})
export class ViewCientComponenet implements OnInit {
  @ViewChild('tabGroup', { static: true }) tabGroup: MatTabGroup;

  captions: any = this.localization.captions.bookAppointment;
  singleUserView: boolean = false;
  constructor(public _cs: ClientService, public localization: RetailLocalization) {
    this._cs.selectedIndex = 0;
  }


  ngOnInit() {
    this.tabGroup._handleClick = this.HandleTabClick.bind(this);
    this.HandleTabClick(0);
  }

  handleSelectedTabChange(event: MatTabChangeEvent): void {
    this._cs.selectedIndex = event.index;
  }

  HandleTabClick(id: number): boolean {
    // this._cs.singleUserView.next(false);
    return true && MatTabGroup.prototype._handleClick.apply(this.tabGroup, arguments);
  }

}
