import { Injectable } from '@angular/core';
import { Localization } from 'src/app/core/localization/Localization';
import * as DashBoardInterface from './dashboard.modal';
// import { UserAccessBreakPoints } from 'src/app/shared/constants/useraccess.constants';
// import { UserAccessBusiness } from 'src/app/shared/data-services/authentication/useraccess.business';
// import { DashBoardService } from 'src/app/shared/data-services/golfschedule/dashboard.data.service';
// import { CourseDataService } from 'src/app/shared/data-services/golfschedule/course.data.service';
// import { CourseOption } from 'src/app/settings/rate-setup/rate-setup.model';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import { Outlet } from 'src/app/retail/retail.modals';
// import { Filter } from 'src/app/shared/shared-models';
import { DashboardWidgetsReportService } from './dashboard-widgets-report.service';
// import { TeeSheetDashboard } from 'src/app/tee-time/shared/tee-sheet/tee-sheet.dashboard';
// import { TeeSheetSkeletonData, ScheduleStatus } from 'src/app/shared/models/teesheet.form.models';
import { Observable, of, BehaviorSubject } from 'rxjs';
// import { DefaultUserConfigDataService } from 'src/app/settings/utilities/manager-utilities/default-user-config/default-user-config.data.service';
// import { TeeTimeConfigDataService } from 'src/app/shared/data-services/golfmanagement/teetime-config.data.service';
import _ from 'lodash';
import { Utilities } from 'src/app/core/utilities';
// import { GolfUserConfigDataService } from 'src/app/shared/data-services/golfmanagement/golfuser.config.data';
// import { Utilities } from 'src/app/shared/utilities/utilities';
// import { PropertyDataService } from 'src/app/settings/system-setup/property-info/property.data.service';
// import { WeatherService } from '../dashboard-weather/weather.service';

@Injectable()
export class DashBoardBusiness {
    public readonly Captions: any;
    public readonly dayFormat: number = 1;
    public readonly weekFormat: number = 2;
    public readonly monthFormat: number = 3;
    constructor(
        ) {
        
    }

   

}