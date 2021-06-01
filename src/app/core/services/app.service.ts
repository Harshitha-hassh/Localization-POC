
import {filter} from 'rxjs/operators';
import { Injectable, EventEmitter } from '@angular/core';
// import { SetUpComponent } from './settings/Setup/setup.component'; 
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GridType } from 'src/app/common/shared/shared/globalsContant';
 

@Injectable()
export class AppModuleService {
  isglobalSearch: boolean;
  selectedShopObj: any;
  therapistObj: any;
  globalsearchTherapist:any = false;
  selectedClient : any;
  public arraysliceValue: number;
  OnTherapistOpen: EventEmitter<any> = new EventEmitter();
  paymentProcessing: boolean = false;
  showHeaderBar: boolean = false;
  paymentCompleted: boolean = true; // to disable actions till payment is completed
  loaderEnable: BehaviorSubject<string> = new BehaviorSubject('');
  // @ViewChild(SetUpComponent, { static: false }) SetUpComponent: SetUpComponent;
  constructor(private route: Router) {
    //this.OnTherapistOpen = this.SetUpComponent.EditRecords.bind(this.SetUpComponent);
    route.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe(event => {
        this.showHeaderBar = event.url === '/shop/viewshop/order' ? true : false;
    });
  }

  triggerTherpistPopup(id: number): void {
    const arr = [id, GridType.therapist]
    this.OnTherapistOpen.emit(arr);
  }

}
