import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderOptionInteface } from '../home.modal';

@Component({
  selector: 'app-dashboard-table',
  templateUrl: './dashboard-table.component.html',
  styleUrls: ['./dashboard-table.component.scss']
})
export class DashboardTableComponent implements OnInit {


  // displayedColumns: string[] = ['position', 'name'];
  @Input() isEnableHeader = false;
  @Input() headerOption: HeaderOptionInteface[] = [];
  @Input() bodyContentdata: any[] = [];
  @Input() footerClassName;
  @Output() rowEmitter = new EventEmitter();
  constructor() { }

  ngOnInit() {
    this.setData();
  }

  setData() {
  }
  arrowClick(e){
    this.rowEmitter.emit(e);
  }
}

