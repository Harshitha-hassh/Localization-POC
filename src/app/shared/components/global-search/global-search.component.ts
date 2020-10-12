import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, Input, ViewChild, AfterViewInit, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { searchtitleenum, GlobalSearchModel, GlobalSearchData } from './global-search.model';
import { Router } from '@angular/router';
import { GlobalSearchBusiness } from './global-search.business';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { ClientPopupComponent } from 'src/app/client/client-popup/client-popup.component';
import { MatDialog } from '@angular/material';
import { AppModuleService } from 'src/app/core/services/app.service';
import { BreakPoint } from '../../models/breakpoint-models';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [GlobalSearchBusiness]
})

export class GlobalSearchComponent implements OnInit, AfterViewInit {

  filterData: any = []; // local filter array
  searchGroupOptions: Promise<GlobalSearchModel[]> = Promise.resolve([]);
  globalSearchForm: FormGroup;
  @Input() open: boolean = false;
  @Output() onSearch = new EventEmitter();
  @Output() OnOptionSelected = new EventEmitter();
  titleEnum = searchtitleenum;
  input_value = '';
  @ViewChild('searchText', { static: false }) searchText: ElementRef;
  captions: any;

  constructor(private _formBuilder: FormBuilder,
    private _router: Router,
    private globalSearchBusiness: GlobalSearchBusiness,
    private localization: RetailStandaloneLocalization,
    private dialog: MatDialog,
    private _as: AppModuleService,
    private userAccessBusiness : UserAccessBusiness
  ) {
    this.captions = this.localization.captions;
  }

  ngOnInit() {
    this.globalSearchForm = this._formBuilder.group({
      searchGroup: '',
    });

  }

  ngAfterViewInit() {
    if (this.searchText && this.searchText.nativeElement) {
      this.searchText.nativeElement.focus();
    }
  }


  public async filterGroup(value: string) {
    this.filterData = [];
    value = value ? value.toString() : "";
    value = value.trim();
    if (value.length >= 3) {
      this.searchGroupOptions = this.globalSearchBusiness.globalSearch(value);

    } else if (value.length <= 2) {
      this.filterData = [];
      this.searchGroupOptions = Promise.resolve([]);
    }
  }

  onInput(e) {
    const inputValue = e.target.value;
    if (inputValue.length > 3) {
      console.log(e.target.value);
    }
    this.onSearch.emit();
  }

  addClient(e) {
    const query = Math.random() * 10;
    this._router.navigate([`login`]);
    // this._router.navigate([`home`], { queryParams: { action: 'add', query: query } });
  }

  filter = (opt: any[], value: string): any[] => {
    const filterValue = value.toLowerCase();
    return opt.filter(item => {
      for (const key in item) {
        if (key == searchtitleenum.booking || key == searchtitleenum.settings || key == searchtitleenum.sales) {
          const returnValue = (item[key].toLowerCase().indexOf(filterValue) === 0);
          if (returnValue) {
            return returnValue;
          }
        }
      }
    });
  };

  linkClicked(title: string, data: any, e) {
    // Random number - To refresh the page everytime
    const query = Math.random() * 10;
    switch (title) {
      case searchtitleenum.sales:
        this._router.navigate([`sales`]);
        break;
      case searchtitleenum.settings:
        this._router.navigate([`settings`]);
        break;
      case searchtitleenum.retailItems:
        this._router.navigate([`/shop/viewshop/`], { queryParams: { description: data.name, id: data.itemId, query } });
        break;
      case searchtitleenum.clients:
        this._as.isglobalSearch = true;
        this._as.selectedClient = data;
        this._router.navigate([`/client/allclients/`, data.guestProfileId + query]);
        break;
      case searchtitleenum.clients:
        this._router.navigate([`/client/allclients/`, data.guestProfileId + query]);
    break;
      default:

    break;
}
this.searchGroupOptions = Promise.resolve([]);
this.OnOptionSelected.emit();
  }

valueMapper() {
  return '';
}

  async openAddClient() {
    var result = await this.userAccessBusiness.getUserAccess(BreakPoint.AddNewClientProfile);
    if (result.isAllow || result.isViewOnly) {
      const dialogRef = this.dialog.open(ClientPopupComponent, {
        width: '95%',
        height: '85%',
        maxWidth: '95%',
        disableClose: true,
        hasBackdrop: true,
        data: { mode: 'CREATE', title: this.captions.NewClient, type: this.captions.save, data: '', closebool: true },
        panelClass: 'small-popup'
      });
    }
  }


async globalSearch(pattern: string): Promise < any[] > {
  const data = [
    { "title": "booking", "dataCollection": [{ "id": 1, "value": "booking 1" }, { "id": 2, "value": "booking 2" }] },
    { "title": "settings", "dataCollection": [{ "id": 1, "value": "settings 1" }] },
    { "title": "sales", "dataCollection": [{ "id": 1, "value": "Sales 1" }, { "id": 2, "value": "Sales 2" }] }
  ];
  return data;
}


}










