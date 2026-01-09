import { Component, OnInit, Input } from '@angular/core';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

@Component({
  standalone: false,
  selector: 'app-no-data-found',
  templateUrl: './no-data-found.component.html',
  styleUrls: ['./no-data-found.component.scss']
})
export class NoDataFoundComponent implements OnInit {
@Input() isSearch;
@Input() schedule;
@Input() title;
@Input() text;
captions: any;
  constructor(private localization: RetailStandaloneLocalization) { }

  ngOnInit() {
    this.captions = this.localization.captions.common;
  }

}
