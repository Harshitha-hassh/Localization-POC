import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AgDropdownConfig } from 'src/app/common/Models/ag-models';
import { ReportBusinessService } from 'src/app/retail/retail-reports/business/report-business.service';
import { ReportGroup } from 'src/app/reports/common/report.constants';
import { ReportSelector_ } from 'src/app/reports/report.model';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';

@Component({
  standalone: false,
  selector: 'app-event-slider',
  templateUrl: './event-slider.component.html',
  styleUrls: ['./event-slider.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventSliderComponent implements OnInit {
  showSlide: boolean;
  patchReportValues: any = {reportName:'',filters : ''};
  reportSelector: ReportSelector_[] = [];
  allDatas : any[] =[];
  fromEdit : boolean = false;
  hideReportConfigSaveBtn = false;
  reportGroupName : string;
  reportSourceConfig: AgDropdownConfig;
  header: string;
  isRetailReport: boolean;
  selectedReport;
  captions;
  @Input('showSlide') 
  set setSlide(value){
    this.showSlide = value
  }

  @Input('isRetailReportVal')
  set isRetailReportValue(value) {
    this.isRetailReport = value;
  }
  
  @Input('reportSelector')
  set setReportInput(value){
    this.reportSelector = value.value;
}
  @Input('inputs') 
  set setInputs(value){
    if(value){
      this.reportSourceConfig = value.reportSourceConfig;
      this.reportSourceConfig = {...this.reportSourceConfig};
      if(value.fromEdit)
      {this.reportSourceConfig.disabled = true}
      else
      this.reportSourceConfig.disabled = false;
      this.patchReportValues = value.patchReportValues;
      this.patchReportValues = {...this.patchReportValues};
      // this.reportSelector = value.allDatas.report;
      this.allDatas = value.allDatas;
      this.fromEdit = value.fromEdit;
      this.hideReportConfigSaveBtn = value.hideReportConfigSaveBtn ;
      this.reportGroupName = value.reportGroupName;      
      this.header = value.header;      
    }
   
  }
  @Output() dropdownConfig = new EventEmitter();
  @Output() saveReport = new EventEmitter();
  @Output() closeSlideEmit = new EventEmitter();
 

  constructor( private localization: RetailLocalization) { }

   ngOnInit() {   
    this.captions = this.localization.captions.ReportSchedular;
  }
  displayReportConfiguration(e){
    // this.selectedReport = e.value.toUpperCase();
    this.dropdownConfig.emit(e);
  }
  saveReportConfig(e){
    this.saveReport.emit(e);
  }
  closeSlide(){
    this.showSlide = false;
    this.closeSlideEmit.emit(false);
  }

}
