import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';


@Component({
  selector: 'app-audit-data',
  templateUrl: './audit-data.component.html',
  styleUrls: ['./audit-data.component.scss']
})
export class AuditDataComponent implements OnInit {
  selectedIndex = 0;
  captions: any;
  constructor(public localization: RetailLocalization) {
   }

  ngOnInit() {
    this.captions = this.localization.captions.dayEnd;
  }

  handleSelectedTabChange(event: MatTabChangeEvent): void
  {
    this.selectedIndex = event.index;
  }
}
