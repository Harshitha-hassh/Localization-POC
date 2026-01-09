import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRountingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import { ViewCientComponenet } from './view-client/view-client.component';
import { SharedModule } from '../shared/shared.module';
import { AllClientsComponent } from './view-client/all-clients/all-clients.component';
import { RecentsComponent } from './view-client/recents/recents.component';
import { VipComponent } from './view-client/vip/vip.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientTableComponent } from './client-table/client-table.component';
import { MatTableModule } from '@angular/material/table';
import { SingleUserViewComponent } from './view-client/client-details/single-user-view/single-user-view.component';
import { ClientfilterpipePipe } from './client-table/clientfilterpipe.pipe';
import { ClientDetailsComponent } from './view-client/client-details/client-details.component';
import { ClientsortpipePipe } from './client-table/clientsortpipe.pipe';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClientService } from '../shared/service/client-service.service';
import { GuestPolicyWrapperComponent } from './client-popup/create-client/additional-information/guest-policy-wrapper/guest-policy-wrapper.component';
import { RetailToggleSwitchModule } from '../retail/retail-toggle-switch/retail-toggle-switch.module';

@NgModule({
    imports: [
        CommonModule,
        ClientRountingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        NgScrollbarModule,
        RetailToggleSwitchModule,
        DragDropModule
    ],
    declarations: [
        ClientComponent,
        ViewCientComponenet,
        AllClientsComponent,
        RecentsComponent,
        VipComponent,
        SingleUserViewComponent,
        ClientTableComponent,
        ClientfilterpipePipe,
        ClientDetailsComponent,
        ClientsortpipePipe,
        GuestPolicyWrapperComponent
    ],
    providers: [ClientService],
    exports: [
        ClientsortpipePipe
    ]
})
export class ClientModule { }
