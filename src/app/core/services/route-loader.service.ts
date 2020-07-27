import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { menuTypes } from 'src/app/shared/enums/menu.constant';

@Injectable()
export class RouteLoaderService {

  currentSettings: any;
  menu = '';

  constructor(
    private httpClient: HttpClient,
    private injector: Injector
  ) {

  }

  // loadSettings(): Promise<any> {
  //     return new Promise((resolve, reject) => {
  //         setTimeout(() => {
  //             const router = this.injector.get(Router);
  //             console.log(router);
  //             this.api.getMenus().then(
  //                     response => {
  //                         console.log('is Dynamic Menu available?:'+(!Array.isArray(response) || 0==response.length)? 'DM-No!':'DM-Yes!');
  //                         this.currentSettings =  response;
  //                         console.log('current settings',this.currentSettings);
  //                         resolve(true);
  //                     },
  //                     err => {
  //                         console.log(err+' and so, loading default menu');
  //                         this.currentSettings = SNCMenus;
  //                         reject(false);
  //                     }
  //                 );
  //         });
  //     });
  // }

  public GetChildMenu(currentRoute, menuType?: menuTypes) {
    this.currentSettings = {
      "result": [
        {
          "elementID": 7,
          "tenantID": 0,
          "propertyID": 0,
          "productID": 0,
          "textID": 2,
          "text": "SETTINGS",
          "routePath": "/setting",
          "imgPath": "/setting",
          "order": 2,
          "visibility": true,
          "disable": false,
          "parentID": 0,
          "menuPosition": "Primary",
          "menuAlignment": "Horizontal",
          "externalLink": false,
          "linkedElement": [
            
            {
              "elementID": 8,
              "tenantID": 0,
              "propertyID": 0,
              "productID": 0,
              "textID": 2,
              "text": "RETAIL SETUP",
              "routePath": "/setting/retailsetup",
              "imgPath": "/setting/retailsetup",
              "order": 1,
              "visibility": true,
              "disable": false,
              "parentID": 7,
              "menuPosition": "secondary",
              "menuAlignment": "Horizontal",
              "externalLink": false,
              "linkedElement": [
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Code Setup",
                  "routePath": "/setting/retailsetup/codesetup",
                  "imgPath": "/setting/retailsetup/codesetup",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": [
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Credit Card Terminals",
                      "routePath": "/setting/retailsetup/codesetup/creditcardterminals",
                      "imgPath": "/setting/retailsetup/codesetup/creditcardterminals",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Outlets",
                      "routePath": "/setting/retailsetup/codesetup/outlets",
                      "imgPath": "/setting/retailsetup/codesetup/outlets",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Category Groups",
                      "routePath": "/setting/retailsetup/codesetup/categorygroups",
                      "imgPath": "/setting/retailsetup/codesetup/categorygroups",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Retail Categories",
                      "routePath": "/setting/retailsetup/codesetup/retailcategories",
                      "imgPath": "/setting/retailsetup/codesetup/retailcategories",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Retail Sub Categories",
                      "routePath": "/setting/retailsetup/codesetup/retailsubcategories",
                      "imgPath": "/setting/retailsetup/codesetup/retailsubcategories",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Unit of Measure",
                      "routePath": "/setting/retailsetup/codesetup/unitofmeasure",
                      "imgPath": "/setting/retailsetup/codesetup/unitofmeasure",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Taxes",
                      "routePath": "/setting/retailsetup/codesetup/taxes",
                      "imgPath": "/setting/retailsetup/codesetup/taxes",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Discount Types",
                      "routePath": "/setting/retailsetup/codesetup/discounttypes",
                      "imgPath": "/setting/retailsetup/codesetup/discounttypes",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Payment Methods",
                      "routePath": "/setting/retailsetup/codesetup/paymentmethods",
                      "imgPath": "/setting/retailsetup/codesetup/paymentmethods",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Quick Sale Categories",
                      "routePath": "/setting/retailsetup/codesetup/quicksalecategories",
                      "imgPath": "/setting/retailsetup/codesetup/quicksalecategories",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "VAT Configuration",
                      "routePath": "/setting/retailsetup/codesetup/vatconfiguration",
                      "imgPath": "/setting/retailsetup/codesetup/vatconfiguration",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Retail Feature Configuration",
                      "routePath": "/setting/retailsetup/codesetup/retailfeatureconfiguration",
                      "imgPath": "/setting/retailsetup/codesetup/retailfeatureconfiguration",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Credit Cards",
                      "routePath": "/setting/retailsetup/codesetup/creditcards",
                      "imgPath": "/setting/retailsetup/codesetup/creditcards",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    },
                    {
                      "elementID": 8,
                      "tenantID": 0,
                      "propertyID": 0,
                      "productID": 0,
                      "textID": 2,
                      "text": "Gift Cards",
                      "routePath": "/setting/retailsetup/codesetup/giftcards",
                      "imgPath": "/setting/retailsetup/codesetup/giftcards",
                      "order": 1,
                      "visibility": true,
                      "disable": false,
                      "parentID": 7,
                      "menuPosition": "Ternary",
                      "menuAlignment": "Vertical",
                      "externalLink": false,
                      "linkedElement": []
                    }
                  ]
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Retail Setup",
                  "routePath": "/setting/retailsetup/retailsetup",
                  "imgPath": "/setting/retailsetup/retailsetup",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Scheduled Markdown",
                  "routePath": "/setting/retailsetup/scheduledmarkdown",
                  "imgPath": "/setting/retailsetup/scheduledmarkdown",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Quick Sale Setup",
                  "routePath": "/setting/retailsetup/quicksalesetup",
                  "imgPath": "/setting/retailsetup/quicksalesetup",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Commission Setup",
                  "routePath": "/setting/retailsetup/commissionsetup",
                  "imgPath": "/setting/retailsetup/commissionsetup",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Discount Configuration",
                  "routePath": "/setting/retailsetup/discountconfiguration",
                  "imgPath": "/setting/retailsetup/discountconfiguration",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Category Linking",
                  "routePath": "/setting/retailsetup/categorylinking",
                  "imgPath": "/setting/retailsetup/categorylinking",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                }
              ]
            }
          ]
        },
        {
          "elementID": 7,
          "tenantID": 0,
          "propertyID": 0,
          "productID": 0,
          "textID": 2,
          "text": "SHOP",
          "routePath": "/shop/viewshop",
          "imgPath": "icon-shop",
          "order": 2,
          "visibility": true,
          "disable": false,
          "parentID": 0,
          "menuPosition": "Primary",
          "menuAlignment": "Horizontal",
          "externalLink": false,
          "linkedElement": [
            {
              "elementID": 8,
              "tenantID": 0,
              "propertyID": 0,
              "productID": 0,
              "textID": 2,
              "text": "RETAIL ITEMS",
              "routePath": "/shop/viewshop/retailitems",
              "imgPath": "/shop/viewshop/retailitems",
              "order": 1,
              "visibility": true,
              "disable": false,
              "parentID": 7,
              "menuPosition": "secondary",
              "menuAlignment": "Horizontal",
              "externalLink": false,
              "linkedElement": []
            },
            {
              "elementID": 8,
              "tenantID": 0,
              "propertyID": 0,
              "productID": 0,
              "textID": 2,
              "text": "RETAIL TRANSACTIONS",
              "routePath": "/shop/viewshop/retailtransactions",
              "imgPath": "/shop/viewshop/retailtransactions",
              "order": 1,
              "visibility": true,
              "disable": false,
              "parentID": 7,
              "menuPosition": "secondary",
              "menuAlignment": "Horizontal",
              "externalLink": false,
              "linkedElement": [
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Open Transactions",
                  "routePath": "/shop/viewshop/retailtransactions/opentransactions",
                  "imgPath": "/shop/viewshop/retailtransactions/opentransactions",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Correct/Void",
                  "routePath": "/shop/viewshop/retailtransactions/correctvoid",
                  "imgPath": "/shop/viewshop/retailtransactions/correctvoid",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Return with Ticket",
                  "routePath": "/shop/viewshop/retailtransactions/returnwithticket",
                  "imgPath": "/shop/viewshop/retailtransactions/returnwithticket",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Return without Ticket",
                  "routePath": "/shop/viewshop/retailtransactions/returnwithoutticket",
                  "imgPath": "/shop/viewshop/retailtransactions/returnwithoutticket",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Modify Posted Commissions",
                  "routePath": "/shop/viewshop/retailtransactions/modifypostedcommission",
                  "imgPath": "/shop/viewshop/retailtransactions/modifypostedcommission",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
                {
                  "elementID": 8,
                  "tenantID": 0,
                  "propertyID": 0,
                  "productID": 0,
                  "textID": 2,
                  "text": "Reprint Ticket",
                  "routePath": "/shop/viewshop/retailtransactions/reprintticket",
                  "imgPath": "/shop/viewshop/retailtransactions/reprintticket",
                  "order": 1,
                  "visibility": true,
                  "disable": false,
                  "parentID": 7,
                  "menuPosition": "Ternary",
                  "menuAlignment": "Vertical",
                  "externalLink": false,
                  "linkedElement": []
                },
              ]
            },
            {
              "elementID": 8,
              "tenantID": 0,
              "propertyID": 0,
              "productID": 0,
              "textID": 2,
              "text": "GIFT CARDS",
              "routePath": "/shop/viewshop/giftcards",
              "imgPath": "/shop/viewshop/giftcards",
              "order": 1,
              "visibility": true,
              "disable": false,
              "parentID": 7,
              "menuPosition": "secondary",
              "menuAlignment": "Horizontal",
              "externalLink": false,
              "linkedElement": []
            }
          ]
        },
        
        {
          "elementID": 7,
          "tenantID": 0,
          "propertyID": 0,
          "productID": 0,
          "textID": 2,
          "text": "REPORTS",
          "routePath": "/report",
          "imgPath": "/report",
          "order": 2,
          "visibility": true,
          "disable": false,
          "parentID": 0,
          "menuPosition": "Primary",
          "menuAlignment": "Horizontal",
          "externalLink": false,
          "linkedElement": []
        },
      ]
    };
    const menuList = this.currentSettings.result;

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
}
