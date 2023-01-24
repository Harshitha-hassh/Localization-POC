import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { AccordianUserConfigComponent } from './accordian-user-config/accordian-user-config.component';
import { CopyRolesComponent } from './copy-roles/copy-roles.component';
import { RetailSettingsComponent } from './new-user/retail-settings/retail-settings.component';
import { RoleSetupComponent } from './role-setup/role-setup.component';
import { UserSetupComponent } from './user-setup/user-setup.component';
import { UserSettingsComponent } from './new-user/user-settings/user-settings.component';
import { ScrollbarModule } from 'ngx-scrollbar';
import { TableComponent } from './table/table.component';
import { UserSetupRoutingModule } from './user-config-routing.module';
import { UserConfigComponent } from './user-config.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { NewUserComponent } from './new-user/new-user.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgDragDropModule } from 'ng-drag-drop';

@NgModule({
    declarations: [
        AccordianUserConfigComponent,
        CopyRolesComponent,
        RetailSettingsComponent,
        RoleSetupComponent,
        UserSetupComponent,
        UserSettingsComponent,
        UserConfigComponent,
        TableComponent,
        UserRoleComponent,
        NewUserComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ScrollbarModule,
        UserSetupRoutingModule,
        UiSwitchModule,
        NgDragDropModule
    ]
})
export class UserSetupModule { }
