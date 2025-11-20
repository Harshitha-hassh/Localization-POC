import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { MenuObj } from 'src/app/common/shared/shared/components/menu-search/menu.model';
import { TenantManagementCommunication } from 'src/app/common/communication/services/tenantmanagement-communication-service';
import { CommonControllersRoutes } from 'src/app/common/communication/common-route';
import { AppService } from 'src/app/common/app-service';
import { Observable, of } from 'rxjs';
import { AgMenuTypes } from 'src/app/shared/components/menu/menu.model';
import { menuTypes as newMenuTypes } from 'src/app/common/components/menu/menu.constant';
import { RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
import { RetailFeatureFlagInformationService } from 'src/app/retail/shared/service/retail.feature.flag.information.service';

@Injectable()
export class RouteLoaderService {

  currentSettings: any;
  menu = '';
  private readonly ProductID: number;

  constructor(
    private injector: Injector,
    private _appservice: AppService,
    private _tenantMngmt: TenantManagementCommunication,
    private propertyInfo : RetailPropertyInformation,
    public featureFlagInfo: RetailFeatureFlagInformationService
  ) {
    this.ProductID = this._appservice.productId;
  }

  loadSettings(): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const router = this.injector.get(Router);
        console.log(router);
        this.getProductMenus().then(
        //this.getSettings().subscribe( // uncomment for hard coded menu
          response => {
            console.log('is Dynamic Menu available?:' + (!Array.isArray(response) || 0 == response.length) ? 'DM-No!' : 'DM-Yes!');
            this.currentSettings = response;
            console.log('current settings', this.currentSettings);
            
          
            
            resolve(true);
            this.featureFlagInfo.GetFeaturesCompleted.subscribe(x => {
              if (!this.featureFlagInfo.IsRetailIcEnabled) {
                  let settingsMenu = this.currentSettings.find(x => x.text.toLowerCase().includes("settings"));
                  let utilsMenu = settingsMenu?.linkedElement?.find(x => x.text.toLowerCase().includes("utilities"));
                  let InventoryMenu = utilsMenu?.linkedElement?.find(x => x.text.toLowerCase().includes("inventory"));
                  let stagingMenu = InventoryMenu?.linkedElement?.find(x => x.text.toLowerCase().includes("inventory staging"));
                  if (stagingMenu) {
                      stagingMenu.visibility = false;
                  }
              }
              if(!this.featureFlagInfo.IsDataExpressEnabled){
                let settingsMenu = this.currentSettings.find(x => x.text.includes("SETTINGS"))
                if (settingsMenu) {
                    let interfacesMenu = settingsMenu.linkedElement?.find(x => x.text.includes("INTERFACES"))
                    if(interfacesMenu){
                        let dataExpressMenu = interfacesMenu.linkedElement?.find(x => x.text.toUpperCase().includes("DIGITAL INVOICE"))
                        if(dataExpressMenu){
                            dataExpressMenu.visibility = false;
                            dataExpressMenu.linkedElement.forEach(element => {
                                element.visibility = false;
                            });
                        }
                    }
                }   
              }
              if(this.featureFlagInfo.DisableForgetPassword){
                let settingsMenu = this.currentSettings.find(x => x.text.includes("SETTINGS"));
                if(settingsMenu){
                  let userSetupMenu = settingsMenu.linkedElement?.find(x => x.text.includes("USER SETUP"));
                  if(userSetupMenu){
                    let userSecurityQuestionsMenu = userSetupMenu.linkedElement?.find(x => x.text.includes("Set / Reset User Security Questions"));
                    if(userSecurityQuestionsMenu){
                      userSecurityQuestionsMenu.visibility = false;
                    }
                  }
                }
              }
              const jsonPropConfig = sessionStorage.getItem('propConfig');
              const parsedConfig = jsonPropConfig ? JSON.parse(jsonPropConfig) : null;
              if ((parsedConfig?.EnablePenetrationCommission??"false") == "false") {
                let settingsMenu = this.currentSettings.find(x => x.text.includes("SETTINGS"))
                if (settingsMenu) {
                    let retailSetupMenu = settingsMenu.linkedElement?.find(x => x.text.includes("RETAIL SETUP"))
                    if(retailSetupMenu){
                        let penetrationCommissionSetupMenu = retailSetupMenu.linkedElement?.find(x => x.routePath?.toLowerCase().includes("/settings/retailsetup/penetrationcommissionsetup"))
                        if(penetrationCommissionSetupMenu){
                            penetrationCommissionSetupMenu.visibility = false;
                            penetrationCommissionSetupMenu.linkedElement.forEach(element => {
                                element.visibility = false;
                            });
                        }
                    }
                }
              }
              var result = sessionStorage.getItem('EnablePhilippinesFiscalReport')?.toLowerCase() === 'true' ? true : false;
               
                        if (!result) {
                            let reportsMenu = this.currentSettings.find(x => x.text.includes("REPORTS"))
                            if (reportsMenu) {
                              console.log('reportsMenu', reportsMenu);
                                let fiscalReportsMenu = reportsMenu.linkedElement?.find(x => x.routePath?.toLowerCase().includes("/reports/fiscalreports"))
                                console.log('fiscalReportsMenu', fiscalReportsMenu);
                                if(fiscalReportsMenu){
                                    fiscalReportsMenu.visibility = false;
                                    fiscalReportsMenu.linkedElement?.forEach(element => {
                                        element.visibility = false;
                                    });
                                }
                            }
                        }
          }
          );
          },
          err => {
            console.log(err + ' and so, loading default menu');
            //this.currentSettings = SNCMenus;
            reject(false);
          }
        );
      });
    });
  }

  public GetChildMenu(currentRoute, menuType?: menuTypes | AgMenuTypes | newMenuTypes ) {
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
          if ((menuType === menuTypes.lowerLevel || menuType === AgMenuTypes.vertical) && obj) {
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
    this.propertyInfo.setICRoutes(menus.find(x => x.routePath == '/settings')?.linkedElement);
    return menus.filter(x => x.productID == this.ProductID);
  }

  public getSettings(): Observable<any> {
    const menuList: any[] = [
      {
        elementID: 4001,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4001,
        text: "HOME_UK",
        routePath: "/home",
        imgPath: "icon-home",
        order: 1,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [

        ],
        breakPointNumber: 0
      },
      {
        elementID: 4002,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4002,
        text: "CLIENT_UK",
        routePath: "/client",
        imgPath: "icon-guest",
        order: 2,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [
          {
            elementID: 4003,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4003,
            text: "ALL CLIENTS_UK",
            routePath: "/client/allclients",
            imgPath: "",
            order: 1,
            visibility: true,
            disable: false,
            parentID: 4002,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 600
          },
          {
            elementID: 4004,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4004,
            text: "RECENTS_UK",
            routePath: "/client/recents",
            imgPath: "",
            order: 2,
            visibility: true,
            disable: false,
            parentID: 4002,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 0
          }
        ],
        breakPointNumber: 0
      },
      {
        elementID: 4005,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4005,
        text: "SHOP_UK",
        routePath: "/shop/viewshop",
        imgPath: "icon-shop",
        order: 3,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [
          {
            elementID: 4006,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4006,
            text: "RETAIL ITEMS_UK",
            routePath: "/shop/viewshop/retailitems",
            imgPath: "",
            order: 1,
            visibility: true,
            disable: false,
            parentID: 4005,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 0
          },
          {
            elementID: 4007,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4007,
            text: "RETAIL TRANSACTIONS_UK",
            routePath: "/shop/viewshop/retailtransactions",
            imgPath: "",
            order: 2,
            visibility: true,
            disable: false,
            parentID: 4005,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [
              {
                elementID: 4008,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4008,
                text: "Open Transactions_UK",
                routePath: "/shop/viewshop/retailtransactions/opentransactions",
                imgPath: "",
                order: 1,
                visibility: true,
                disable: false,
                parentID: 4007,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 5000
              },
              {
                elementID: 4009,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4009,
                text: "Correct/Void_UK",
                routePath: "/shop/viewshop/retailtransactions/correctvoid",
                imgPath: "",
                order: 2,
                visibility: true,
                disable: false,
                parentID: 4007,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                elementID: 4010,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4010,
                text: "Return with Ticket_UK",
                routePath: "/shop/viewshop/retailtransactions/returnwithticket",
                imgPath: "",
                order: 3,
                visibility: true,
                disable: false,
                parentID: 4007,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 5010
              },
              {
                elementID: 4011,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4011,
                text: "Return without Ticket_UK",
                routePath: "/shop/viewshop/retailtransactions/returnwithoutticket",
                imgPath: "",
                order: 4,
                visibility: true,
                disable: false,
                parentID: 4007,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 5015
              },
              {
                elementID: 4012,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4012,
                text: "Modify Posted Commissions_UK",
                routePath: "/shop/viewshop/retailtransactions/modifypostedcommission",
                imgPath: "",
                order: 5,
                visibility: true,
                disable: false,
                parentID: 4007,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 5020
              },
              {
                elementID: 4013,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4013,
                text: "Reprint Ticket_UK",
                routePath: "/shop/viewshop/retailtransactions/reprintticket",
                imgPath: "",
                order: 6,
                visibility: true,
                disable: false,
                parentID: 4007,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 5025
              }
            ],
            breakPointNumber: 0
          },
          {
            elementID: 4014,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4014,
            text: "GIFT CARDS_UK",
            routePath: "/shop/viewshop/giftcards",
            imgPath: "",
            order: 3,
            visibility: true,
            disable: false,
            parentID: 4005,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 0
          }
        ],
        breakPointNumber: 0
      },
      {
        elementID: 4015,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4015,
        text: "SETTINGS_UK",
        routePath: "/settings",
        imgPath: "icon-settings",
        order: 4,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [
          {
            elementID: 4016,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4016,
            text: "SYSTEM SETUP_UK",
            routePath: "/settings/systemsetup",
            imgPath: "",
            order: 1,
            visibility: true,
            disable: false,
            parentID: 4015,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [
              {
                elementID: 4017,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4017,
                text: "Property Information_UK",
                routePath: "/settings/systemsetup/propertyinfo",
                imgPath: "",
                order: 1,
                visibility: true,
                disable: false,
                parentID: 4016,
                menuAlignment: 'Vertical',
                menuPosition: 'Ternary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                elementID: 4018,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4018,
                text: "Miscellaneous_UK",
                routePath: "/settings/systemsetup/miscellaneous",
                imgPath: "",
                order: 2,
                visibility: true,
                disable: false,
                parentID: 4016,
                menuAlignment: 'Vertical',
                menuPosition: 'Ternary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                elementID: 4019,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4019,
                text: "Notifications_UK",
                routePath: "/settings/systemsetup/notifications",
                imgPath: "",
                order: 3,
                visibility: true,
                disable: false,
                parentID: 4016,
                menuAlignment: 'Vertical',
                menuPosition: 'Ternary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              }
            ],
            breakPointNumber: 2085
          },
          {
            elementID: 4020,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4020,
            text: "RETAIL SETUP_UK",
            routePath: "/settings/retailsetup",
            imgPath: "",
            order: 1,
            visibility: true,
            disable: false,
            parentID: 4015,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [
              {
                elementID: 4021,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4021,
                text: "Code Setup_UK",
                routePath: "/settings/retailsetup/codesetup",
                imgPath: "",
                order: 1,
                visibility: true,
                disable: false,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4022,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4022,
                    text: "Credit Card Terminals_UK",
                    routePath: "/settings/retailsetup/codesetup/creditcardterminals",
                    imgPath: "",
                    order: 1,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7025
                  },
                  {
                    elementID: 4023,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4023,
                    text: "Outlets_UK",
                    routePath: "/settings/retailsetup/codesetup/outlets",
                    imgPath: "",
                    order: 2,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7000
                  },
                  {
                    elementID: 4024,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4024,
                    text: "Store Terminals_UK",
                    routePath: "/settings/retailsetup/codesetup/storeterminals",
                    imgPath: "",
                    order: 3,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7090
                  },
                  {
                    elementID: 4025,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4025,
                    text: "Category Groups_UK",
                    routePath: "/settings/retailsetup/codesetup/categorygroups",
                    imgPath: "",
                    order: 4,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7030
                  },
                  {
                    elementID: 4026,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4026,
                    text: "Retail Categories_UK",
                    routePath: "/settings/retailsetup/codesetup/retailcategories",
                    imgPath: "",
                    order: 5,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7035
                  },
                  {
                    elementID: 4027,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4027,
                    text: "Retail Sub Categories_UK",
                    routePath: "/settings/retailsetup/codesetup/retailsubcategories",
                    imgPath: "",
                    order: 6,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7040
                  },
                  {
                    elementID: 4028,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4028,
                    text: "Unit of Measure_UK",
                    routePath: "/settings/retailsetup/codesetup/unitofmeasure",
                    imgPath: "",
                    order: 7,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7015
                  },
                  {
                    elementID: 4029,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4029,
                    text: "Taxes_UK",
                    routePath: "/settings/retailsetup/codesetup/taxes",
                    imgPath: "",
                    order: 8,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7050
                  },
                  {
                    elementID: 4030,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4030,
                    text: "Discount Types_UK",
                    routePath: "/settings/retailsetup/codesetup/discounttypes",
                    imgPath: "",
                    order: 9,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7060
                  },
                  {
                    elementID: 4031,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4031,
                    text: "Payment Methods_UK",
                    routePath: "/settings/retailsetup/codesetup/paymentmethods",
                    imgPath: "",
                    order: 10,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7070
                  },
                  {
                    elementID: 4032,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4032,
                    text: "Quick Sale Categories_UK",
                    routePath: "/settings/retailsetup/codesetup/quicksalecategories",
                    imgPath: "",
                    order: 11,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7010
                  },
                  {
                    elementID: 4033,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4033,
                    text: "VAT Configuration_UK",
                    routePath: "/settings/retailsetup/codesetup/vatconfiguration",
                    imgPath: "",
                    order: 12,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4034,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4034,
                    text: "Retail Feature Configuration_UK",
                    routePath: "/settings/retailsetup/codesetup/retailfeatureconfiguration",
                    imgPath: "",
                    order: 13,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4035,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4035,
                    text: "Credit Cards_UK",
                    routePath: "/settings/retailsetup/codesetup/creditcards",
                    imgPath: "",
                    order: 14,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4036,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4036,
                    text: "Gift Cards_UK",
                    routePath: "/settings/retailsetup/codesetup/giftcards",
                    imgPath: "",
                    order: 15,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4037,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4037,
                    text: "Vendor Type_UK",
                    routePath: "/settings/retailsetup/codesetup/vendortypes",
                    imgPath: "",
                    order: 15,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4079,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4079,
                    text: "Post Type Mapping_UK",
                    routePath: "/settings/retailsetup/codesetup/posttypemapping",
                    imgPath: "",
                    order: 16,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 1072,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 1,
                    textID: 1051,
                    text: "Tier Level",
                    routePath: "/settings/retailsetup/codesetup/tierLevel",
                    imgPath: "",
                    order: 17,
                    visibility: true,
                    disable: false,
                    parentID: 1063,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [],
                    breakPointNumber: 7060
                },
                ],
                breakPointNumber: 0
              },
              {
                elementID: 4038,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4038,
                text: "Retail Setup_UK",
                routePath: "/settings/retailsetup/retailsetup",
                imgPath: "",
                order: 2,
                visibility: true,
                disable: false,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 7061
              },
              {
                elementID: 4039,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4039,
                text: "Quick Sale Setup_UK",
                routePath: "/settings/retailsetup/quicksalesetup",
                imgPath: "",
                order: 3,
                visibility: true,
                disable: false,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 7010
              },
              {
                elementID: 4040,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4040,
                text: "Commission Setup_UK",
                routePath: "/settings/retailsetup/commissionsetup",
                imgPath: "",
                order: 4,
                visibility: true,
                disable: false,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 7020
              },
              {
                elementID: 4041,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4041,
                text: "Discount Configuration_UK",
                routePath: "/settings/retailsetup/discountconfiguration",
                imgPath: "",
                order: 5,
                visibility: true,
                disable: true,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                elementID: 4042,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4042,
                text: "Category Linking_UK",
                routePath: "/settings/retailsetup/categorylinking",
                imgPath: "",
                order: 6,
                visibility: true,
                disable: false,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 7041
              },
              {
                elementID: 4028,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4028,
                text: "Penetration Commission Setup_UK",
                routePath: "/settings/retailsetup/penetrationcommissionsetup",
                imgPath: "",
                order: 7,
                visibility: true,
                disable: false,
                parentID: 4021,
                menuPosition: "Ternary",
                menuAlignment: "Vertical",
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 800
              },
              {
                elementID: 4043,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4043,
                text: "Vendor Setup_UK",
                routePath: "/settings/retailsetup/vendorsetup",
                imgPath: "",
                order: 7,
                visibility: true,
                disable: false,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                elementID: 4043,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4043,
                text: "Payment Manager",
                routePath: "/settings/retailsetup/paymentmanager",
                imgPath: "",
                order: 7,
                visibility: true,
                disable: false,
                parentID: 4020,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4022,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4022,
                    text: "Outlets",
                    routePath: "/settings/retailsetup/paymentmanager/outlets",
                    imgPath: "",
                    order: 1,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7025
                  },
                  {
                    elementID: 4022,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4022,
                    text: "Pay Agents",
                    routePath: "/settings/retailsetup/paymentmanager/payagents",
                    imgPath: "",
                    order: 1,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7025
                  },
                  {
                    elementID: 4022,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4022,
                    text: "Settlers",
                    routePath: "/settings/retailsetup/paymentmanager/settlers",
                    imgPath: "",
                    order: 1,
                    visibility: true,
                    disable: false,
                    parentID: 4021,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 7025
                  },
                  // {
                  //   elementID: 4022,
                  //   tenantID: 0,
                  //   propertyID: 0,
                  //   productID: 2,
                  //   textID: 4022,
                  //   text: "History",
                  //   routePath: "/settings/retailsetup/paymentmanager/history",
                  //   imgPath: "",
                  //   order: 1,
                  //   visibility: true,
                  //   disable: false,
                  //   parentID: 4021,
                  //   menuPosition: "Ternary",
                  //   menuAlignment: "Vertical",
                  //   externalLink: false,
                  //   linkedElement: [

                  //   ],
                  //   breakPointNumber: 7025
                  // },
                ],
                breakPointNumber: 0
              }
            ],
            breakPointNumber: 0
          },
          {
            elementID: 4044,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4044,
            text: "COMMISSION SETUP_UK",
            routePath: "/settings/commisionsetup/commission",
            imgPath: "",
            order: 3,
            visibility: true,
            disable: false,
            parentID: 4015,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 800
          },
          {
            elementID: 4045,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4045,
            text: "INVENTORY_UK",
            routePath: "/settings/inventorysetup",
            imgPath: "",
            order: 4,
            visibility: true,
            disable: false,
            parentID: 4015,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 8722
          },
          {
            elementID: 4046,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4046,
            text: "UTILITIES_UK",
            routePath: "/settings/utilities",
            imgPath: "",
            order: 5,
            visibility: true,
            disable: false,
            parentID: 4015,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [
              {
                elementID: 4047,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4047,
                text: "Manager Utilities_UK",
                routePath: "/settings/utilities/managerUtilities",
                imgPath: "",
                order: 1,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4050,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4050,
                    text: "Printer Default Configurations_UK",
                    routePath: "/settings/utilities/managerUtilities/printerDefaultConfiguration",
                    imgPath: "",
                    order: 1,
                    visibility: true,
                    disable: false,
                    parentID: 4049,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                ],
                breakPointNumber: 7080
              },
              {
                elementID: 4047,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4047,
                text: "Receipt Configuration_UK",
                routePath: "/settings/utilities/receiptconfiguration",
                imgPath: "",
                order: 1,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 7080
              },
              {
                elementID: 4048,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4048,
                text: "User Machine Configuration_UK",
                routePath: "/settings/utilities/usermachineconfiguration",
                imgPath: "",
                order: 2,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 7085
              },
              {
                elementID: 4049,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4049,
                text: "Templates_UK",
                routePath: "/settings/utilities/templates",
                imgPath: "",
                order: 3,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4050,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4050,
                    text: "Email Templates_UK",
                    routePath: "/settings/utilities/templates/email",
                    imgPath: "",
                    order: 1,
                    visibility: true,
                    disable: false,
                    parentID: 4049,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4051,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 4051,
                    text: "SMS Templates_UK",
                    routePath: "/settings/utilities/templates/sms",
                    imgPath: "",
                    order: 2,
                    visibility: true,
                    disable: false,
                    parentID: 4049,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  }
                ],
                breakPointNumber: 0
              },
              {
                elementID: 4052,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4052,
                text: "Distribution List_UK",
                routePath: "/settings/utilities/distributionlist",
                imgPath: "",
                order: 4,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                elementID: 4082,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4082,
                text: "Quick ID Config_UK",
                routePath: "/settings/utilities/quickidconfig",
                imgPath: "",
                order: 5,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                elementID: 4082,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4082,
                text: "Enahanced Inventory Master Sync",
                routePath: "/settings/utilities/enhancedinventorymastersync",
                imgPath: "",
                order: 5,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                ],
                breakPointNumber: 0
              },
              {
                elementId: 8258,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textId: 101685,
                text: "Config Validation_UK",
                routePath: "/settings/utilities/configValidation",
                imgPath: "",
                order: 5,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                ],
                breakPointNumber: 0
              },
              {
                elementID: 4082,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4082,
                text: "CGPS FAILED PROFILE",
                routePath: "/settings/utilities/cgpsFailedProfile",
                imgPath: "",
                order: 5,
                visibility: true,
                disable: false,
                parentID: 4046,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 0
              },
              {
                "elementID": 1099,
                "tenantID": 0,
                "propertyID": 0,
                "productID": 1,
                "textID": 1124,
                "text": "Other Components/ Discount Mapping",
                "routePath": "/settings/utilities/discountMapping",
                "imgPath": "",
                "order": 10,
                "visibility": true,
                "disable": false,
                "parentID": 1051,
                "menuPosition": "Ternary",
                "menuAlignment": "Vertical",
                "externalLink": false,
                "linkedElement": [],
                "breakPointNumber": 0
            },
            ],
            breakPointNumber: 0
          },
          {
            elementID: 4053,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4053,
            text: "USER SETUP_UK",
            routePath: "/settings/userconfig",
            imgPath: "",
            order: 6,
            visibility: true,
            disable: false,
            parentID: 4015,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [
              {
                elementID: 4054,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4054,
                text: "User Setup_UK",
                routePath: "/settings/userconfig/usersetup",
                imgPath: "",
                order: 1,
                visibility: true,
                disable: false,
                parentID: 4053,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 2300
              },
              {
                elementID: 4055,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4055,
                text: "Role Setup_UK",
                routePath: "/settings/userconfig/rolesetup",
                imgPath: "",
                order: 2,
                visibility: true,
                disable: false,
                parentID: 4053,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 2305
              },
              {
                elementID: 4056,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 4056,
                text: "User Role Configuration_UK",
                routePath: "/settings/userconfig/userroleconfiguration",
                imgPath: "",
                order: 3,
                visibility: true,
                disable: false,
                parentID: 4053,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [

                ],
                breakPointNumber: 2310
              }
            ],
            breakPointNumber: 0
          },
          {
            elementID: 4064,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 1103,
            text: "ENHANCED INVENTORY_UK",
            routePath: "/settings/enhancedInventory",
            imgPath: "",
            order: 7,
            visibility: true,
            disable: false,
            parentID: 4015,
            menuPosition: "Ternary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [
              {
                elementID: 4065,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 1104,
                text: "Inventory Management_UK",
                routePath: "/settings/enhancedInventory/inventory",
                imgPath: "",
                order: 1,
                visibility: true,
                disable: false,
                parentID: 4064,
                menuPosition: "Ternary",
                menuAlignment: "Combo",
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4067,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1105,
                    text: "Inventory_UK",
                    routePath: "settings/enhancedInventory/masterlist/inventorylist",
                    imgPath: "",
                    order: 1,
                    visibility: true,
                    disable: false,
                    parentID: 4065,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 8731
                  },
                  {
                    elementID: 4068,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1106,
                    text: "Transfer_UK",
                    routePath: "settings/enhancedInventory/transfer/transfer",
                    imgPath: "",
                    order: 2,
                    visibility: false,
                    disable: false,
                    parentID: 4065,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 8732
                  },
                  {
                    elementID: 4071,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1110,
                    text: "Requisitions_UK",
                    routePath: "/settings/enhancedInventory/requisition/viewrequisition",
                    imgPath: "",
                    order: 3,
                    visibility: false,
                    disable: false,
                    parentID: 4065,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4072,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1111,
                    text: "Physical Inventory_UK",
                    routePath: "settings/enhancedInventory/transaction/view-physicalinventory",
                    imgPath: "",
                    order: 4,
                    visibility: true,
                    disable: false,
                    parentID: 4065,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 8733
                  }
                ],
                breakPointNumber: 0
              },
              {
                elementID: 4066,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 1107,
                text: "Procurement_UK",
                routePath: "/settings/enhancedInventory/procurement",
                imgPath: "",
                order: 2,
                visibility: true,
                disable: false,
                parentID: 4064,
                menuPosition: "Ternary",
                menuAlignment: "Combo",
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4073,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1112,
                    text: "Blanket Purchase Order_UK",
                    routePath: "/settings/enhancedInventory/blanketpurchaseorder/bpolanding",
                    imgPath: "",
                    order: 1,
                    visibility: false,
                    disable: false,
                    parentID: 4066,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  },
                  {
                    elementID: 4074,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1109,
                    text: "Receiving_UK",
                    routePath: "settings/enhancedInventory/transaction/view-receiving",
                    imgPath: "",
                    order: 2,
                    visibility: true,
                    disable: false,
                    parentID: 4066,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 8734
                  },
                  {
                    elementID: 4075,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1108,
                    text: "Purchase Order_UK",
                    routePath: "settings/enhancedInventory/transaction/view-purchaseorder",
                    imgPath: "",
                    order: 3,
                    visibility: true,
                    disable: false,
                    parentID: 4066,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 8735
                  },
                  {
                    elementID: 4076,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1113,
                    text: "Purchase Requests_UK",
                    routePath: "/settings/enhancedInventory/purchaserequest/pr-landing",
                    imgPath: "",
                    order: 4,
                    visibility: false,
                    disable: false,
                    parentID: 4066,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  }
                ],
                breakPointNumber: 0
              },
              {
                elementID: 4069,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 1114,
                text: "Reports_UK",
                routePath: "/settings/enhancedInventory/reports",
                imgPath: "",
                order: 3,
                visibility: false,
                disable: false,
                parentID: 4064,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4077,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1114,
                    text: "Reports_UK",
                    routePath: "/settings/enhancedInventory/reports",
                    imgPath: "",
                    order: 1,
                    visibility: false,
                    disable: false,
                    parentID: 4069,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  }
                ],
                breakPointNumber: 0
              },
              {
                elementID: 4070,
                tenantID: 0,
                propertyID: 0,
                productID: 2,
                textID: 1115,
                text: "Pending Approvals_UK",
                routePath: "/settings/enhancedInventory/pendingapproval/allpendingapprovals",
                imgPath: "",
                order: 4,
                visibility: false,
                disable: false,
                parentID: 4064,
                menuAlignment: 'Combo',
                menuPosition: 'Secondary',
                externalLink: false,
                linkedElement: [
                  {
                    elementID: 4078,
                    tenantID: 0,
                    propertyID: 0,
                    productID: 2,
                    textID: 1115,
                    text: "Pending Approvals_UK",
                    routePath: "/settings/enhancedInventory/pendingapproval/allpendingapprovals",
                    imgPath: "",
                    order: 1,
                    visibility: false,
                    disable: false,
                    parentID: 4070,
                    menuPosition: "Ternary",
                    menuAlignment: "Vertical",
                    externalLink: false,
                    linkedElement: [

                    ],
                    breakPointNumber: 0
                  }
                ],
                breakPointNumber: 0
              }
            ],
            breakPointNumber: 0
          }
        ],
        breakPointNumber: 0
      },
      {
        elementID: 4057,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4057,
        text: "REPORTS_UK",
        routePath: "/reports",
        imgPath: "icon-reports",
        order: 5,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [
          {
            elementID: 4058,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4058,
            text: "RETAIL_UK",
            routePath: "/reports/retail",
            imgPath: "",
            order: 1,
            visibility: true,
            disable: false,
            parentID: 4057,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 0
          },
          {
            elementID: 4059,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4059,
            text: "COMMISSION/GRATUITY/SERVICE CHARGE_UK",
            routePath: "/reports/commissiongratuity",
            imgPath: "",
            order: 2,
            visibility: true,
            disable: false,
            parentID: 4057,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 1245
          },
          {
            elementID: 4060,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4060,
            text: "TRANSACTION LOG_UK",
            routePath: "/reports/transactionlog",
            imgPath: "",
            order: 5,
            visibility: true,
            disable: false,
            parentID: 4057,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 8005
          },
          {
            elementID: 4061,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4014,
            text: "GIFT CARDS_UK",
            routePath: "/reports/giftcards",
            imgPath: "",
            order: 4,
            visibility: true,
            disable: false,
            parentID: 4057,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 0
          }
        ],
        breakPointNumber: 0
      },
      {
        elementID: 4062,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4061,
        text: "AUDIT_UK",
        routePath: "/audit",
        imgPath: "icon-Audit",
        order: 6,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [
          {
            elementID: 4063,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4062,
            text: "MANUAL AUDIT_UK",
            routePath: "/audit/dayend",
            imgPath: "",
            order: 1,
            visibility: true,
            disable: false,
            parentID: 4062,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 2430
          },
          {
            elementID: 4063,
            tenantID: 0,
            propertyID: 0,
            productID: 2,
            textID: 4062,
            text: "NIGHT AUDIT_UK",
            routePath: "/audit/nightaudit",
            imgPath: "",
            order: 1,
            visibility: true,
            disable: false,
            parentID: 4062,
            menuPosition: "Secondary",
            menuAlignment: "Horizontal",
            externalLink: false,
            linkedElement: [

            ],
            breakPointNumber: 2430
          },
        ],
        breakPointNumber: 0
      },
      {
        elementID: 4001,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4001,
        text: "All",
        routePath: "/all",
        imgPath: "icon-all-menu",
        order: 1,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [

        ],
        breakPointNumber: 0
      },
      {
        elementID: 4001,
        tenantID: 0,
        propertyID: 0,
        productID: 2,
        textID: 4001,
        text: "Search Report",
        routePath: "/allReport",
        imgPath: "icon-Search-Reports",
        order: 1,
        visibility: true,
        disable: false,
        parentID: 0,
        menuPosition: "Primary",
        menuAlignment: "Horizontal",
        externalLink: false,
        linkedElement: [

        ],
        breakPointNumber: 0
      },
    ]
    return of(menuList);
  }

}
