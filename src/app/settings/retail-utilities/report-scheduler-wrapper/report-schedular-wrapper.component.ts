import { Component, OnInit } from '@angular/core';
import { DropdownOptions } from 'src/app/common/Models/ag-models';
import { JobSchedulerDataServices } from 'src/app/common/dataservices/notification/job-scheduler.data.service';
import { NotificationConfigurationService } from 'src/app/common/templates/notification-configuration/notification-configuration.service';
import { TemplateDataServices } from 'src/app/common/dataservices/notification/template-data-service';
import { Distribution, DistributionType, TemplateType } from 'src/app/common/templates/notification-configuration/notification-configuration.model';
import { PatternType, UI, API, DaysOfWeek, GroupName, ReportType, ScheduleJobConfig } from 'src/app/common/shared/shared/event-scheduler/event-scheduler.model';
import { NotificationTemplate } from 'src/app/common/templates/template-email/crud-email-template/crud-email-template.model';
import { ReportControlBuilder } from 'src/app/retail/retail-reports/business/reportControlBuilder';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailFeatureFlagInformationService } from 'src/app/retail/shared/service/retail.feature.flag.information.service';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { CommonUtilities } from 'src/app/common/shared/shared/utilities/common-utilities';
import { ReportAPIOptions, ReportSelector_ } from 'src/app/reports/report.model';
import { ReportSelectorBuilder } from 'src/app/reports/common/report.selector';
import { ReportGroup as ReportTypes } from 'src/app/reports/common/report.constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
@Component({
  selector: 'app-report-schedular-wrapper',
  templateUrl: './report-schedular-wrapper.component.html',
  styleUrls: ['./report-schedular-wrapper.component.scss'],
  providers: [
    JobSchedulerDataServices,
    NotificationConfigurationService,
    TemplateDataServices,
    RetailFeatureFlagInformationService
  ]
})
export class ReportSchedularWrapperComponent implements OnInit {

  inputs: any;
  report = ReportTypes;
  displayReportConfiguration: any;
  saveReportConfig: any;
  reportSelector: ReportSelector_[] = [];
  showSlide: boolean;
  editObject: any;
  isRetailReport = false;
  public destroyed = new Subject<any>();
  constructor(private jobSchedulerDataServices: JobSchedulerDataServices
    , private notificationConfigurationService: NotificationConfigurationService,
    private templateDataServices: TemplateDataServices,
    public localization: RetailLocalization
    , public retailFeature: RetailFeatureFlagInformationService
    , public retailUtils: RetailUtilities,
    private utilities: CommonUtilities, private propertyInfo : RetailPropertyInformation) { }

  ngOnInit(): void {
  }
  edittedValues(eve){
    this.inputs = eve;
    this.isRetailReport = eve.isRetailReport;
  }
  dropdownConfig(e){
    this.displayReportConfiguration= e;
    this.displayReportConfiguration = {...this.displayReportConfiguration}
  }
  saveReport(e){
    this.saveReportConfig = e;
  }
  emitReportSelector(e){
    this.reportSelector = e;
  }
  slideSelector(e){
    this.showSlide = e;
  }
  async editEventEmit(e) {
    this.utilities.ToggleLoader(true);
    const [eventDetailsData, notificationData] = await this.getEditData(e.event, e.report);
    this.utilities.ToggleLoader(false);
    this.editObject = {
      eventDetailsData: eventDetailsData,
      notificationData: notificationData
    }
  }
  async getEditData(id: number, report) {
    const schedule = await this.jobSchedulerDataServices.getScheduleById(id);
    const result = await this.getRequiredServices();
    return [this.updateScheduleMapper(schedule, result[0], result[1], result[2], result[3], report),
    this.getNotificationDetails(schedule?.recurrenceDefinition)];
  }
  async getRequiredServices() {
    const scheduleJobsPromise = this.jobSchedulerDataServices.getAllScheduleJob();
    const distributionListPromise = this.notificationConfigurationService.getAllDistributionByProductId();
    const emailTemplateListPromise = this.templateDataServices.GetAllTemplates(TemplateType.Email, false);
    const smsTemplateListPromise = this.templateDataServices.GetAllTemplates(TemplateType.SMS, false);
    const result = await Promise
      .all([scheduleJobsPromise, distributionListPromise, emailTemplateListPromise, smsTemplateListPromise]);
    return result;
  }
  groupDistListMapper(grpParticular: API.ScheduleJobParticular[], distributionList: Distribution[]) {
    const distList: string[] = [];
    const [guestParticular, userParticular] = grpParticular;
    const emailDistributionList: Distribution[] = distributionList.filter(x => x.distributionType === DistributionType.EMAIL || x.distributionType === DistributionType.BOTH);
    const smsDistributionList: Distribution[] = distributionList.filter(x => x.distributionType === DistributionType.SMS || x.distributionType === DistributionType.BOTH);
    const guestEmailDL = emailDistributionList?.find(x => guestParticular?.emailDistributionId === x.id);
    const guestSMSDL = smsDistributionList?.find(x => guestParticular?.smsDistributionId === x.id);
    const userEmailDL = emailDistributionList?.find(x => userParticular?.emailDistributionId === x.id);
    const userSMSDL = smsDistributionList?.find(x => userParticular?.smsDistributionId === x.id);
    return [guestEmailDL, guestSMSDL, userEmailDL, userSMSDL];
  }
  updateScheduleMapper(schedule: API.ScheduleJobConfiguration, scheduleJobs: API.ScheduleJob[], distributionList: Distribution[],
    emailTemplateList: NotificationTemplate[], smsTemplateList: NotificationTemplate[], report): UI.ScheduleParticulars {
    const grpParticular = this.groupParticularMapper(schedule?.scheduleJobParticular);
    const [guestParticular, userParticular] = grpParticular;
    const [guestEmailDL, guestSMSDL, userEmailDL, userSMSDL] = this.groupDistListMapper(grpParticular, distributionList);
    const [guestEmailTemplate, guestSMSTemplate, userEmailTemplate, userSMSTemplate] = this.groupTemplateMapper(grpParticular, emailTemplateList, smsTemplateList);
    const jobParticular: UI.ScheduleParticulars = {
      id: schedule?.id,
      event: this.jobMappingByName(schedule.scheduleJobName, scheduleJobs),

      active: guestParticular?.sendMail || guestParticular?.sendSMS,
      guestEmail: guestParticular?.sendMail,
      guestEmailSubj: guestParticular?.subject,
      guestSms: guestParticular?.sendSMS,
      userEmail: userParticular?.sendMail,
      userEmailSubj: userParticular?.subject,
      userSMS: userParticular?.sendSMS,
      schedulerCode: schedule.code,
      schedulerName: schedule.description,
      guestEmailDL: this.distributionListMapper(guestEmailDL),
      guestSMSDL: this.distributionListMapper(guestSMSDL),
      guestEmailTemplate: this.notificationTemplateMapper(guestEmailTemplate),
      guestSMSTemplate: this.notificationTemplateMapper(guestSMSTemplate),
      userEmailDL: this.distributionListMapper(userEmailDL),
      userSMSDL: this.distributionListMapper(userSMSDL),
      userEmailTemplate: this.notificationTemplateMapper(userEmailTemplate),
      userSMSTemplate: this.notificationTemplateMapper(userSMSTemplate),
      report: this.reportOptionMapper(schedule?.reportConfiguration, report),
      reportName: this.reportNameMapper(schedule?.reportConfiguration, report),
      reportType: this.reportTypeOptionMapper(schedule?.reportConfiguration),
      sftpRemoteDirectory: schedule?.sftpDirectory ? schedule?.sftpDirectory : '',
      ftpRemoteDirectory: schedule?.ftpDirectory ? schedule?.ftpDirectory : '',
      reportCard: this.reportCardMapper(schedule?.reportConfiguration, report),
      isSFTP: schedule.isSFTP,
      isFTP: schedule.isFTP,
      jobSchedulerId: 0,
      type: this.TypeOptionMapper(schedule?.fileFormat),
      sftpSetupId : schedule.sftpSetupId,
      patchReportConfiguration: (schedule?.scheduleJobId != Number(ScheduleJobConfig.ExecuteQuery)) ? JSON.parse(schedule?.reportConfiguration) as UI.PatchReportConfiguration : null,
      patchExecuteQueryConfiguration: (schedule?.scheduleJobId == Number(ScheduleJobConfig.ExecuteQuery)) ? JSON.parse(schedule?.executeQueryConfiguration) as UI.PatchExecuteQueryConfig : null,
      scheduleOperationConfiguration: (schedule?.scheduleJobName == ScheduleJobConfig[ScheduleJobConfig.API]) ? JSON.parse(schedule?.executeQueryConfiguration) as UI.ScheduleOperationDetail : null,
      scheduleadhocReportConfiguration: (schedule?.scheduleJobId == Number(ScheduleJobConfig.AdhocReport)) ? JSON.parse(schedule?.executeQueryConfiguration) as UI.ScheduleAdhocReport : null
      //scheduleOperationConfiguration: (schedule?.scheduleJobId == Number(ScheduleJobConfig.API)) ? JSON.parse(schedule?.scheduleOperationConfiguration) as UI.ScheduleOperationDetail : null
    };
    return jobParticular;
  }
  jobMapper(id: number, scheduleJobs: API.ScheduleJob[]): DropdownOptions {
    const jobDetail = scheduleJobs?.find(o => o.id === id);
    return jobDetail
      ? {
        id: jobDetail?.id,
        value: jobDetail.jobName,
        viewValue: jobDetail.jobName
      } as DropdownOptions
      : {} as DropdownOptions;
  }

  jobMappingByName(jobName: string, scheduleJobs: API.ScheduleJob[]): DropdownOptions {
    const jobDetail = scheduleJobs?.find(o => o.jobName === jobName);
    return jobDetail
      ? {
        id: jobDetail?.id,
        value: jobDetail.jobName,
        viewValue: jobDetail.jobName
      } as DropdownOptions
      : {} as DropdownOptions;
  }

  groupParticularMapper(scheduleJobParticular: API.ScheduleJobParticular[]): API.ScheduleJobParticular[] {
    const guestParticular: API.ScheduleJobParticular = scheduleJobParticular?.find(x => x.groupName === GroupName[0]);
    const userParticular: API.ScheduleJobParticular = scheduleJobParticular?.find(x => x.groupName === GroupName[1]);
    return [guestParticular, userParticular];
  }

  groupTemplateMapper(grpParticular: API.ScheduleJobParticular[], emailTemplateList: NotificationTemplate[], smsTemplateList: NotificationTemplate[]) {
    const [guestParticular, userParticular] = grpParticular;
    const guestEmailTemplate = emailTemplateList?.find(o => guestParticular?.emailTemplateId === o.id);
    const guestSMSTemplate = smsTemplateList?.find(o => guestParticular?.smsTemplateId === o.id);
    const userEmailTemplate = emailTemplateList?.find(o => userParticular?.emailTemplateId === o.id);
    const userSMSTemplate = smsTemplateList?.find(o => userParticular?.smsTemplateId === o.id);
    return [guestEmailTemplate, guestSMSTemplate, userEmailTemplate, userSMSTemplate];
  }

    getNotificationDetails(recurrenceDefinition: string): UI.RecurrenceRule {
        if (recurrenceDefinition) {
            const recurrenceDef: API.RecurrenceRule = JSON.parse(recurrenceDefinition);
            const pattern: API.Pattern = recurrenceDef.pattern;
            const range: API.Range = recurrenceDef.range;
            const recurrenceRule: Partial<UI.RecurrenceRule> = {
                scheduleType: pattern.patternType.toString(),
                noOfOccurance: range?.noOfOccurence,
                startDate: range?.startDate != null ? new Date(range.startDate) : null,
                endDate: range?.endDate != null ? new Date(range.endDate) : null,
                end: range?.rangeType,
                startTime: range?.startDate != null ? this.localization.ConvertDateToTime(range.startDate) : null

            };
            switch (pattern.patternType) {
                case PatternType.Daily:
                    recurrenceRule.days = pattern?.interval;
                    break;
                case PatternType.Weekly:
                    recurrenceRule.recurEveryWeek = pattern?.interval;
                    recurrenceRule.specificDays = this.getSpecificDays(pattern?.daysOfWeek);
                    break;
                case PatternType.Monthly:
                    recurrenceRule.dayMonth = pattern?.position;
                    recurrenceRule.ofEveryMonth = pattern?.interval;
                    recurrenceRule.monthDays = pattern?.dayOfMonth;
                    break;
                case PatternType.Yearly:
                    recurrenceRule.ofEveryYear = pattern?.interval;
                    recurrenceRule.yearlyDay = pattern?.dayOfMonth;
                    recurrenceRule.yearlyDays = pattern?.position;
                    recurrenceRule.yearlyMonths = pattern?.month;
                    break;
            }
            return recurrenceRule as UI.RecurrenceRule;
        }
    }
  distributionListMapper(data: Distribution): DropdownOptions {
    return data
      ? {
        id: data.id,
        value: data.distributionName,
        viewValue: data.distributionName
      } as DropdownOptions
      : {} as DropdownOptions;
  }

  notificationTemplateMapper(data: NotificationTemplate): DropdownOptions {
    return data
      ? {
        id: data.id,
        value: data.templateName,
        viewValue: data.templateName
      }
      : {} as DropdownOptions;
  }
  reportOptionMapper(reportConfiguration: string, report): DropdownOptions {
    const reportConfig = reportConfiguration ? JSON.parse(reportConfiguration) : '';
    return reportConfig && reportConfig.reportGroup
      ? {
        id: reportConfig.reportGroup,
        value: report[reportConfig.reportGroup],
        viewValue: report[reportConfig.reportGroup]
      }
      : {} as DropdownOptions;
  }
  reportTypeOptionMapper(reportConfiguration: string): DropdownOptions {
    const reportConfig = reportConfiguration ? JSON.parse(reportConfiguration) : '';
    return reportConfig && reportConfig.reportAPIOptions.format
      ? {
        id: ReportType[reportConfig.reportAPIOptions.format],
        value: Object.keys(ReportType).filter(key => !isNaN(Number(key))),
        viewValue: (String)(Object.keys(ReportType).filter(key => !isNaN(Number(key))))
      }
      : {} as DropdownOptions;
  }

  TypeOptionMapper(reportsource: number): DropdownOptions {
    let reportSource = this.getAllReportType();
    let editdata = reportSource.find(t => t.id == reportsource);
    if (editdata) {
      return {
        id: editdata.id,
        value: editdata.value,
        viewValue: editdata?.viewValue
      } as DropdownOptions;
    }

    let defaultdata = reportSource[0];
    return {
      id: defaultdata.id,
      value: defaultdata.value,
      viewValue: defaultdata?.viewValue
    } as DropdownOptions;

  }

  getAllReportType(): DropdownOptions[] {
    return [
      {
        id: 0,
        value: 0,
        viewValue: "PDF"
      },
      {
        id: 2,
        value: 2,
        viewValue: "EXCEL"
      },
      {
        id: 3,
        value: 3,
        viewValue: "WORD"
      },
      {
        id: 5,
        value: 5,
        viewValue: "CSV"
      },
      {
        id: 6,
        value: 6,
        viewValue: "TEXT"
      },
      {
          id: 8,
          value: 8,
          viewValue: "RAWDATA"
      }
    ];
  }



  reportNameMapper(reportConfiguration: string, report): string {
    const reportConfig = reportConfiguration  ? JSON.parse(reportConfiguration) : '';
    if(!reportConfig) return '';
    let reportSelector: any;
    if (reportConfig.reportGroup == report.Retail ||
      reportConfig.reportGroup == report.GiftCards ||
      reportConfig.reportGroup == report.Commissiongratuity) {
      const retailSelector = new ReportControlBuilder(this.localization, this.retailUtils, this.retailFeature, this.propertyInfo);
      reportSelector = retailSelector.reportSelector;
      return reportSelector.find(o => o.code === reportConfig.reportAPIOptions.code)?.value;
      }
    else {
      // const selector = new ReportSelectorBuilder(this.localization, this.reportDataService);
      // selector.getReportSelections(reportConfig.reportGroup);
      // selector.reportList.pipe(takeUntil(this.destroyed)).subscribe(res => {
      //   this.reportSelector = res;
      // });
     return this.reportSelector.find(o => o.code === reportConfig.reportAPIOptions.code)?.value;
    }

  }
  reportCardMapper(reportConfiguration: string, report): UI.ReportCard {
    const reportCard: UI.ReportCard = {
      id: 1,
      value: {},
      reportModule: this.getReportModuleOption(reportConfiguration, report),
      reportName: this.reportNameMapper(reportConfiguration, report),
      reportModuleName: this.getReportModuleName(reportConfiguration, report)
    };
    return reportCard;
  }
  getReportModuleName(reportConfiguration: string, report): string {
    const reportConfig = reportConfiguration ? JSON.parse(reportConfiguration) : '';
    return report[reportConfig?.reportGroup];
  }
  getReportModuleOption(reportConfiguration: string, report): DropdownOptions {
    const reportConfig = reportConfiguration ? JSON.parse(reportConfiguration) : '';
    const reportModuleOption: DropdownOptions = {
      id: reportConfig?.reportGroup,
      value: report[reportConfig?.reportGroup],
      viewValue: report[reportConfig?.reportGroup]
    };
    return reportModuleOption;
  }
  getSpecificDays(daysOfWeek: string[]): boolean[] {
    const specificDays: boolean[] = [];
    Object.keys(DaysOfWeek).map((o, index) => {
      specificDays[index] = daysOfWeek.find(x => x === DaysOfWeek[o]) ? true : false;
    });
    return specificDays;
  }
  retailReportEmitter(e) {
    this.isRetailReport = e;
  }

}
