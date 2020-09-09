import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { MenuObj } from 'src/app/common/shared/shared/components/menu-search/menu.model';
import { TenantManagementCommunication } from 'src/app/common/communication/services/tenantmanagement-communication-service';
import { CommonControllersRoutes } from 'src/app/common/communication/common-route';
import { AppService } from 'src/app/common/app-service';

@Injectable()
export class RouteLoaderService {

  currentSettings: any;
  menu = '';
  private readonly ProductID: number;

  constructor(
    private httpClient: HttpClient,
    private injector: Injector,
    private _appservice: AppService,
    private _tenantMngmt: TenantManagementCommunication
  ) {
    this.ProductID = this._appservice.productId;
  }

  loadSettings(): Promise<any> {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const router = this.injector.get(Router);
              console.log(router);
              this.getProductMenus().then(
                      response => {
                          console.log('is Dynamic Menu available?:'+(!Array.isArray(response) || 0==response.length)? 'DM-No!':'DM-Yes!');
                          this.currentSettings =  response;
                          console.log('current settings',this.currentSettings);
                          resolve(true);
                      },
                      err => {
                          console.log(err+' and so, loading default menu');
                          //this.currentSettings = SNCMenus;
                          reject(false);
                      }
                  );
          });
      });
  }

  public GetChildMenu(currentRoute, menuType?: menuTypes) {
    const menuList = this.currentSettings;

    if (menuList) {
      if (currentRoute === '/') {
        return menuList;
      }
      // let currentMenu = menuList.menu.find(x => x.route === currentRoute);
      let currentMenu = menuList.find(x => x.routePath === currentRoute);
      if (currentMenu) {
        return currentMenu;
      } else {
        for (const x of menuList) {
          const obj: any[] = x.linkedElement ? x.linkedElement : null;
          // currentMenu = obj && obj.find(sub => sub.route === currentRoute);
          currentMenu = obj && obj.find(sub => sub.routePath === currentRoute);
          if (currentMenu) {
            return currentMenu;
          }
          if (menuType === menuTypes.lowerLevel && obj) {
            for (const childMenu of obj) {
              const childObj: any[] = childMenu.linkedElement ? childMenu.linkedElement : null;
              // const currentChildMenu = childObj && childObj.find(sub => sub.route === currentRoute);
              const currentChildMenu = childObj && childObj.find(sub => sub.routePath === currentRoute);
              if (currentChildMenu) {
                return currentChildMenu;
              }

            }
          }
        }
      }
    }

  }

  async getProductMenus(): Promise<MenuObj[]> {
    let menus: MenuObj[] = [];
    menus = await this._tenantMngmt.getPromise({
      route: CommonControllersRoutes.GetMenus,
      uriParams: ""
    });

    return menus.filter(x => x.productID == this.ProductID);
  }
}
