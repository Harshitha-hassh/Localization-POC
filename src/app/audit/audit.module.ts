import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditComponent } from './audit.component';
import { AuditDataComponent } from './audit-data/audit-data.component';
import { DayEndComponent } from './audit-data/day-end/day-end.component';
import { RouterModule } from '@angular/router';
import { AuditRoutingModule } from './audit-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AuditService } from './audit.service';
// import { AppointmentActionModule } from '../shared/appointment-actions/appointment-action.module';
// import { SlideInformationService } from '../shared/slide-information/slide-information.service';
//import { AppointmentActionsDialogComponent } from '../appointment/appointment-actions-dialog/appointment-actions-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AuditRoutingModule,
  // AppointmentActionModule,
  SharedModule
  ],
  declarations: [AuditComponent, AuditDataComponent, DayEndComponent],//, AppointmentActionsDialogComponent],
  providers: [ AuditService,
  //  SlideInformationService
  ],
  //entryComponents: [AppointmentActionsDialogComponent]
})
export class AuditModule { }
