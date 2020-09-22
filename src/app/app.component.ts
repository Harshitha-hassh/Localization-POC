import { Component, HostListener } from '@angular/core';
import { AppBusiness } from './app.business';
import { ManageSessionService } from './login/manage-session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppBusiness]
})
export class AppComponent {
  title = 'Retail-UI';
  constructor(
    private appBusiness: AppBusiness,
    private sessionService: ManageSessionService,
    ) {

  }

  /**
   * @method @HostListener
   * @description If listener watch the Entire Application mousemove and keydown Event
   */

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    if (this.sessionService.resetOnTrigger) {
      this.sessionService.resetTimer();
    }

  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (this.sessionService.resetOnTrigger) {
      this.sessionService.resetTimer();
    }
  }
}
