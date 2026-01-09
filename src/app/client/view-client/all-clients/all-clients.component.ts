

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
@Component({
  standalone: false,
  selector: 'app-all-clients',
  templateUrl: './all-clients.component.html',
  styleUrls: ['./all-clients.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AllClientsComponent implements OnInit {
  ngOnInit(){}
}
