import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatamagineRoutingModule } from './datamagine-routing.module';
import { CommonSharedModule } from 'src/app/common/shared/shared/shared.module';
import { DataMagineComponent } from 'src/app/common/data-magine/data-magine/data-magine.component';
import { DatamagineConfigurationComponent } from 'src/app/common/data-magine/datamagine-configuration/datamagine-configuration.component';
import { DataMagineSettingsComponent } from 'src/app/common/data-magine/data-magine-settings/data-magine-settings.component';
import { DataMagineConfigComponent } from 'src/app/common/data-magine/data-magine-config/data-magine-config.component';
import { DataMagineDocComponent } from 'src/app/common/data-magine/data-magine-doc/data-magine-doc.component';
import { CreateDataMagineComponent } from 'src/app/common/data-magine/data-magine-doc/create-data-magine/create-data-magine.component';
import { BookingRoomDefenitionComponent } from 'src/app/common/data-magine/data-magine-settings/booking-room-defenition/booking-room-defenition.component';
import { DocumentCodesComponent } from 'src/app/common/data-magine/document-codes/document-codes.component';
import { CreateDocumentCodesComponent } from 'src/app/common/data-magine/document-codes/create-document-codes/create-document-codes.component';
import { DmScanPreviewComponent } from 'src/app/common/data-magine/dm-scan-preview/dm-scan-preview.component';
import { DmAutomailComponent } from 'src/app/common/data-magine/dm-automail/dm-automail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropFileModule } from 'src/app/common/components/drag-drop-file/drag-drop-file.module';
import { FacadeService } from 'src/app/common/services/facade.service';
import { EformsBusiness } from 'src/app/common/data-magine/dm-eforms/dm-eforms.business';
import { DatamagineConfigBusiness } from 'src/app/common/data-magine/data-magine-config/data-magine-config.business';
import { DMConfigDataService } from 'src/app/common/dataservices/datamagine-config.data.service';
import { DataMagineIntegrationDataService } from 'src/app/common/dataservices/data-magine-integration.data.service';


@NgModule({
  declarations: [DataMagineComponent, DatamagineConfigurationComponent, DataMagineSettingsComponent, DataMagineConfigComponent, DataMagineDocComponent, CreateDataMagineComponent,BookingRoomDefenitionComponent, DocumentCodesComponent, CreateDocumentCodesComponent, DmScanPreviewComponent, DmAutomailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropFileModule,
    CommonSharedModule,
    DatamagineRoutingModule
  ],
  providers : [FacadeService, EformsBusiness, DatamagineConfigBusiness]
})
export class DatamagineModule { }
