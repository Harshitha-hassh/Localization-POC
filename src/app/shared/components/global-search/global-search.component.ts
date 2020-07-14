import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, Input, ViewChild, AfterViewInit, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { searchtitleenum, GlobalSearchModel, GlobalSearchData } from './global-search.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: []
})

export class GlobalSearchComponent implements OnInit, AfterViewInit {

  filterData: any = []; // local filter array
  searchGroupOptions: Promise<GlobalSearchModel[]>;
  globalSearchForm: FormGroup;
  @Input() open: boolean = false;
  @Output() onSearch = new EventEmitter();
  @Output() OnOptionSelected = new EventEmitter();
  titleEnum = searchtitleenum;
  @ViewChild("searchText", { static: false }) searchText: ElementRef;
  captions: any;

  constructor(private _formBuilder: FormBuilder
    , private _router: Router    
    ) { }

  ngOnInit() {    
    this.globalSearchForm = this._formBuilder.group({
      searchGroup: '',
    });

  }

  ngAfterViewInit() {
    if (this.searchText && this.searchText.nativeElement)
      this.searchText.nativeElement.focus();
  }

  public async filterGroup(value: string) {
    this.filterData = [];
    value = value ? value.toString() : "";
    value = value.trim();
    if (value.length >= 3) {      
      this.searchGroupOptions =this.globalSearch(value);
      
    }
    else if (value.length <= 2) {
      this.filterData = [];
      this.searchGroupOptions = Promise.resolve([]);
    }
  }

  onInput(e) {
    let inputValue = e.target.value;
    if (inputValue.length > 3) {
      console.log(e.target.value);
    }
    this.onSearch.emit();
  }

  addPlayer(e) {
    var query = Math.random() * 10;
    this._router.navigate([`login`]);
    // this._router.navigate([`home`], { queryParams: { action: 'add', query: query } });
  }

  filter = (opt: any[], value: string): any[] => {
    const filterValue = value.toLowerCase();
    return opt.filter(item => {
      for (var key in item) {
        if (key == searchtitleenum.booking || key == searchtitleenum.settings || key == searchtitleenum.sales) {
          let returnValue = (item[key].toLowerCase().indexOf(filterValue) === 0);
          if (returnValue) {
            return returnValue;
          }
        }
      }
    });
  };

  linkClicked(title:string, data: GlobalSearchData, e) {
    // Random number - To refresh the page everytime
    var query = Math.random() * 10;
    switch (title) {
      case searchtitleenum.booking:
        this._router.navigate([`booking`]);        
      break;             
      case searchtitleenum.sales:
        this._router.navigate([`sales`]);        
      break;                              
      case searchtitleenum.settings:
        this._router.navigate([`settings`]);        
      break;                              
      default:
      
      break;
    }
    this.searchGroupOptions = Promise.resolve([]);
    this.OnOptionSelected.emit();
  }

  valueMapper() {
    return '';
  };


  async globalSearch(pattern: string): Promise<any[]> {
    let data =[
      {"title" :"booking","dataCollection":[{"id":1,"value":"booking 1"},{"id":2,"value":"booking 2"}]},
      {"title" :"settings","dataCollection":[{"id":1,"value":"settings 1"}]},
      {"title" :"sales","dataCollection":[{"id":1,"value":"Sales 1"},{"id":2,"value":"Sales 2"}]}
    ];
    return data;
  }


}










