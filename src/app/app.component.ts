import { Component } from '@angular/core';
import { AppBusiness } from './app.business';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppBusiness]
})
export class AppComponent {
  title = 'Retail-UI';
  constructor(
    private appBusiness: AppBusiness
    ) {

  }
}
