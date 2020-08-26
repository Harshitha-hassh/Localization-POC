import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { AccordianUserConfigComponent } from './accordian-user-config/accordian-user-config.component';
import { CopyRolesComponent } from './copy-roles/copy-roles.component';
import { RetailSettingsComponent } from './new-user/retail-settings/retail-settings.component';
import { RoleSetupComponent } from './role-setup/role-setup.component';
import { UserSetupComponent } from './user-setup/user-setup.component';
import { UserSettingsComponent } from './new-user/user-settings/user-settings.component';

@NgModule({
    declarations: [
        AccordianUserConfigComponent,
        CopyRolesComponent,
        RetailSettingsComponent,
        RoleSetupComponent,
        UserSetupComponent,
        UserSettingsComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ],
    entryComponents: []
})
export class UserSetupModule { }
