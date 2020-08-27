import { Component, OnInit, Input } from '@angular/core';
import { Localization } from 'src/app/core/localization/Localization';

@Component({
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
  constructor(private localization: Localization) { }

  ngOnInit() {
    this.captions = this.localization.captions.common;
  }

}
