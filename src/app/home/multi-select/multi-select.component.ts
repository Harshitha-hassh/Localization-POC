import { Component, OnInit, Input, Output, ViewEncapsulation, EventEmitter, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

@Component({
  standalone: false,
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MultiSelectComponent implements OnInit , OnChanges {
  more: string;
  valuesSelected: any[] = [];
  @Input() floatLabel: string;
  @Input() customClass: string;
  @Input() dropDownControlname: string;
  @Input() dropDownName: string;
  @Input() dropDownFilterData;
  @Input() defaultData: any = [];
  @Input() automationId : string = '';
  dropDownFrmGrp: UntypedFormGroup;
  @Input() selectedData: any = [];
  @Output() dropDownFrmControl: EventEmitter<any> = new EventEmitter<any>();
  @Output() IsAnySelected: EventEmitter<any> = new EventEmitter<any>();
  constructor(private localization: RetailStandaloneLocalization) { }

  ngOnInit() {
    this.more = this.localization.captions.common.More;
    this.valuesSelected = this.dropDownFilterData.slice(0, this.dropDownFilterData.length);
    
  }
  ngOnChanges() {
    this.dropDownFrmGrp = new UntypedFormGroup({
      [this.dropDownControlname]: new UntypedFormControl([])
    });
    let x = this.dropDownFilterData.filter(x=>(this.selectedData.indexOf(x.id) !=-1));

    this.dropDownFrmGrp.controls[this.dropDownControlname].setValue(x);

   // this.dropDownFrmGrp.controls[this.dropDownControlname].setValue(this.dropDownFilterData);
    this.dropDownFrmControl.emit([this.dropDownControlname, <UntypedFormControl> this.dropDownFrmGrp.controls[this.dropDownControlname]]);
  }

  filterDropDownSelected(event: any, data: any, allData: any[], dropDownType) {
    if (data && data.value && data.value.toLowerCase() === 'all') {
      this.valuesSelected = this.toggleClickbtn(this.defaultData, allData, this.valuesSelected, this.defaultData, event.checked);
    } else {
      this.valuesSelected = this.toggleClickbtn(data, allData, this.valuesSelected, this.defaultData);
    }
    this.dropDownFrmGrp.controls[dropDownType].setValue(this.valuesSelected);
    this.IsAnySelected.emit(this.valuesSelected);
  }

  toggleClickbtn(data: any, dataSourceArray: any[], selectedDataArray: any[], defaultData?: any, allselectedCheck?): any[] {
    let selectedArray = selectedDataArray;
    const currentlySelectedArray = data;
    if (currentlySelectedArray.id == defaultData.id) { /* For all button click */
      if (allselectedCheck) {
        selectedArray = [];
        selectedArray = dataSourceArray.map(x => x);
      } else {
        selectedArray = [];
      }
    } else { /* For other than all button click */
      if (selectedArray.indexOf(currentlySelectedArray) == -1) {
        selectedArray.push(currentlySelectedArray);
      } else {
        selectedArray.splice(selectedArray.indexOf(currentlySelectedArray), 1);
        if (selectedArray.indexOf(defaultData) != -1) {
          selectedArray.splice(selectedArray.indexOf(defaultData), 1);
        }
      }
    }
    selectedDataArray = selectedArray;
    return selectedArray;
  }
}
