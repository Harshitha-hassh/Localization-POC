import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card-type',
  templateUrl: './card-type.component.html',
  styleUrls: ['./card-type.component.scss']
})
export class CardTypeComponent implements OnInit {
  @Input() type: string;
  constructor() { }

  ngOnInit() {
    this.type = this.type.toLowerCase();
  }
}
