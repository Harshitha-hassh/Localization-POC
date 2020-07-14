import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Localization } from 'src/app/core/localization/Localization';
// import { ManageSessionService } from 'src/app/login/manage-session.service';
// import { SortOrderPipe } from 'src/app/pipes/sort-order.pipe';
import { menuTypes } from '../../enums/menu.constant';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {

  menuList: any;
  menuItems: any;
  isMenu: boolean;
  position: string;
  moreTextName = 'More';
  moreListItem: any = [];
  isSubMenu = false;
  searchOpen = false;
  menusearchOpen = false;
  headerPopOver: any;
  logOutPopOver: any;
  lowerLevelSubMenu: any;
  verticalFlag = false;
  levelMenu: menuTypes;
  menuType = menuTypes;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  @ViewChild('userPopOver', { static: false }) userPopUp: ElementRef;
  @ViewChild('logOutPopOver', { static: false }) logPopOver: ElementRef;
  @ViewChild('navBar', { static: false }) navBar: ElementRef;
  @ViewChild('RouterOutlet', { static: false }) outlet: RouterOutlet;

  selectedItem: any;
  userName: string;
  userText: string; // change after login creation
  userRole: string;
  firstName: string;
  lastName: string;
  // sortPipe: SortOrderPipe;
  captions: any;

  @Input('menu')
  set MenuValue(value) {
    this.menuList = value;
    this.levelMenu = value.menuType;
    // this.menuList.menu = this.sortPipe.transform(this.menuList.menu, 'order', 'aesc');
    console.log("menulist", this.menuList);
  }

  constructor(public router: Router
    , private _localization: Localization
    // , private _sessionService: ManageSessionService
    , private activeRoute: ActivatedRoute) {
    // this.sortPipe = new SortOrderPipe();
  }

  ngOnInit() {
    this.captions = this._localization.captions;
    this.userName = this._localization.GetUserInfo("userName");
    this.firstName = this._localization.GetUserInfo("firstName");
    this.lastName = this._localization.GetUserInfo("lastName");
    this.userRole = this._localization.GetUserInfo("roleName");
    if (this.firstName == "undefined" || this.lastName == "undefined" || this.firstName == undefined || this.lastName == undefined) {
      this.userText = this.userName ? this.userName.charAt(0).toUpperCase() : '';
    }
    else {
      this.userText = this.firstName.charAt(0).toUpperCase() + this.lastName.charAt(0).toUpperCase();
    }
    if (this.levelMenu === menuTypes.tertiary) {
      this.selectedItem = this.menuList.menu.find(x => this.router.url.indexOf(x.routePath) > -1);
      this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(x => {
        this.selectedItem = this.menuList.menu.find(menu => this.router.url.indexOf(menu.routePath) > -1);
        this.selectedItem = {...this.selectedItem};
      });
    }  
  }

  compareSelect = (val1, val2) => {
    return val1 && val2 && val1.text === val2.text;
  }

  ngAfterViewInit() {
    if (this.levelMenu === menuTypes.primary) {
      setTimeout(() => {
        this.bindHeaderData();
      }, 1);
    }
  }

  ngOnDestroy() {
    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }
  }

  // Calculation for more options
  bindHeaderData() {
    const menuItem = cloneDeep(this.menuList.menu);
    let menuTobeShown = [];
    this.moreListItem = [];
    let headerWidth = 0;
    let moreCalc = false;
    const parentelementWidth = this.navBar.nativeElement.clientWidth;
    for (let i = 0; i < menuItem.length; i++) {
      const elementWidth = this.getTextWidth(menuItem[i].text, '100 14px LatoWeb');
      headerWidth += elementWidth + 66;
      if ((parentelementWidth - headerWidth) >= elementWidth) {
        moreCalc = false;
        menuTobeShown.push(menuItem[i]);
      } else {
        moreCalc = true;
        break;
      }
    }
    if (moreCalc) {
      menuTobeShown = [];
      headerWidth = 0;
      const moreWidth = this.getTextWidth(this.moreTextName, '100 14px LatoWeb');
      const LegendsWidth = parentelementWidth - (moreWidth + 66);
      for (let i = 0; i < menuItem.length; i++) {
        const elementWidth = this.getTextWidth(menuItem[i].text, '100 14px LatoWeb');
        headerWidth += elementWidth + 66;
        if ((LegendsWidth - headerWidth) >= elementWidth) {
          menuTobeShown.push(menuItem[i]);
        } else {
          this.moreListItem.push({ imgPath: menuItem[i].imgPath, text: menuItem[i].text, routePath: menuItem[i].routePath, visibility: menuItem[i].visibility });
        }
      }
    }
    this.menuItems = menuTobeShown;
    this.onResize();
  }

  // Text width
  getTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text.toUpperCase());
    if (canvas) {
      canvas.remove();
    }
    return Math.ceil(metrics.width);
  }

  userPop(logOutPopOver) {
    this.logOutPopOver = logOutPopOver;
    const logOut = this.logOutPopOver.element.nativeElement;
    logOut.querySelectorAll('div')[0].style.display = 'none';
    setTimeout(() => {
      const popover = logOut.querySelectorAll('div');
      const leftValue = popover[0].style.left.split('px');
      popover[0].style.left = (Number(leftValue[0])) + 'px';
      popover[0].style.top = 60 + 'px';
      popover[0].style.display = 'block';
    }, 100);
  }

  onResize() {
    // For closing the more pop over
    if (this.headerPopOver) {
      this.headerPopOver.hide();
    }

    // For closing the logout pop over
    if (this.logOutPopOver) {
      this.logOutPopOver.hide();
    }
  }

  openPopUp(popOver) {
    this.headerPopOver = popOver;
  }

  async logout() {
    // await this._sessionService.logout();
  }

  onSearch(e: any) {

  }

  openGlobalSearch(e, type) {
    this.searchOpen = !this.searchOpen;
    this.menusearchOpen=false;
  }

  openMenuSearch() {
    this.menusearchOpen = !this.menusearchOpen;
    this.searchOpen=false;
  }

  OptionSelected(event) {
    this.searchOpen = false;
  }

  MenuOptionSelected(event) {
  this.menusearchOpen = false;
}

  navigateTo(option) {
    this.router.navigate([option.value.routePath],{state:{ShowPopup: true, onSubmoduleChange: true}});
  }
}
