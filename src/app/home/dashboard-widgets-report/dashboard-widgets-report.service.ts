import { Injectable } from '@angular/core';
// import { CourseOption } from 'src/app/settings/rate-setup/rate-setup.model';
import { OutletOption } from './dashboard.modal';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';

@Injectable()
export class DashboardWidgetsReportService {
  widgetsData: any; // dynamic template data
  DashBoardwidgetsData: any; // dynamic template data
  CourseData: any[];
  AvailableTeeTimesCount: number;
  CancelledTeeTimesCount: number;
  NewPlayers: number;
  RepeatPlayers: number;
  // UpComingTournaments : UITournamentDetails[];
  // Outlets:OutletOption[];
  // ItemsData: ItemData[];
  OutletsData: OutletOption[];
  // CategoriesData: CategoryData[];
  // WaitlistData : UIWaitlistDetail[];
  captions: any;


  constructor(private localization: RetailStandaloneLocalization) {
    this.captions = this.localization.captions['dashBoard'];
    // this.OutletsData=[
    //   {id: 1 ,name: 'outlet 1' ,description: 'outlet 1' ,defaultOutletId : 1 },
    //   {id: 2 ,name: 'outlet 2' ,description: 'outlet 2' ,defaultOutletId : 2 },
    //   {id: 3 ,name: 'outlet 3' ,description: 'outlet 3' ,defaultOutletId : 3 }
    // ];
    this.OutletsData = this.OutletsData;
   }

  getWidget() {
    return this.widgetsData = [
      {
        widgetWrapper: {
          title: this.captions.Sales,
          icon: {
            show: false,
            path: 'icon-name'
          },
          dropDown: {
            show: true,
            placeholder: this.captions.Outlets,
            floatLabel: 'never',
            dropDownControlname: 'SalesHeadOutlet',
            dropDownName: this.captions.allOutlets,
            defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
            dropDownOptions: this.OutletsData,
          },
          manage: {
            show: true,
            title: this.captions.Manage,
            innerTitle: 'Manage'
          }
        },
        widget: [
          {
            order: 1,
            show: true,
            allow: true,
            parentClass: 'sales',
            customClass: 'section_1 ',
            config: {
              useConfig: true,
              width: 60,
              widthUnit: '%',
              height: '455',
              heightUnit: 'px'
            },
            title: {
              show: true,
              icon: {
                show: true,
                path: 'icon-charts'
              },
              title: this.captions.SalesRevenue,
              multiSelect: {
                show: true,
                multiSelectData: [
                  { description: this.captions.DAY, id: 1, name: this.captions.DAY, selected: true },
                  { description: this.captions.WEEK, id: 2, name: this.captions.WEEK, selected: false },
                  { description: this.captions.MONTH, id: 3, name: this.captions.MONTH, selected: false }
                ]
              },
              dropDown: {
                show: false,
                // placeholder: this.captions.Outlets,
                // floatLabel: 'never',
                // dropDownControlname: 'Sales_Revenue',
                // dropDownName: this.captions.allOutlets,
                // defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                // dropDownOptions: this.OutletsData,
              }
            },
            template: {
              name: 'Sales_Revenue'
            },
            footer: {
              show: false
            }
          },
          {
            order: 2,
            show: true,
            allow: true,
            parentClass: 'sales',
            customClass: 'section_1',
            config: {
              useConfig: true,
              width: 40,
              widthUnit: '%',
              height: '455',
              heightUnit: 'px'
            },
            title: {
              show: true,
              icon: {
                show: false
              },
              title: this.captions.OutofStockItems,
              multiSelect: {
                show: false
              },
              dropDown: {
                show: true,
                placeholder: this.captions.Outlets,
                floatLabel: 'never',
                dropDownControlname: 'Out_of_StockItems',
                dropDownName: this.captions.allOutlets,
                defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                dropDownOptions: this.OutletsData,
              }
            },
            template: {
              name: 'Out_of_StockItems'
            },
            footer: {
              show: true,
              title: this.captions.ViewCompleteList,
              showArrow: true,
              routingPath: 'settings/retailsetup/retailsetup'
            }
          },
          {
            order: 3,
            show: true,
            allow: true,
            parentClass: 'sales',
            customClass: 'section_1',
            config: {
              useConfig: true,
              width: 100,
              widthUnit: '%',
              height: '455',
              heightUnit: 'px'
            },
            title: {
              show: true,
              icon: {
                show: true,
                path: 'icon-coins'
              },
              title: this.captions.RevenueByOutlet,
              multiSelect: {
                show: true,
                multiSelectData: [
                  { description: this.captions.DAY, id: 1, name: this.captions.DAY, selected: true },
                  { description: this.captions.WEEK, id: 2, name: this.captions.WEEK, selected: false },
                  { description: this.captions.MONTH, id: 3, name: this.captions.MONTH, selected: false }
                ]
              },
              dropDown: {
                show: true,
                placeholder: this.captions.Outlets,
                floatLabel: 'never',
                dropDownControlname: 'Revenue_By_Outlet',
                dropDownName: this.captions.allOutlets,
                defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                dropDownOptions: this.OutletsData,
              },

            },
            template: {
              name: 'Revenue_By_Outlet'
            },
            footer: {
              show: false
            }
          },
          {
            order: 4,
            show: true,
            allow: true,
            parentClass: 'sales',
            customClass: 'section_1 ',
            config: {
              useConfig: true,
              width: 50,
              widthUnit: '%',
              height: '455',
              heightUnit: 'px'
            },
            title: {
              show: true,
              icon: {
                show: true,
                path: 'icon-revenue2'
              },
              title: this.captions.topFive,
              multiSelect: {
                show: true,
                multiSelectData: [
                  { description: this.captions.DAY, id: 1, name: this.captions.DAY, selected: true },
                  { description: this.captions.WEEK, id: 2, name: this.captions.WEEK, selected: false },
                  { description: this.captions.MONTH, id: 3, name: this.captions.MONTH, selected: false }
                ]
              },
              dropDown: {
                show: true,
                placeholder:this.captions.Outlets,
                floatLabel: 'never',
                dropDownControlname: 'Sales_Top5Items',
                dropDownName: this.captions.allOutlets,
                defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                dropDownOptions: this.OutletsData,
              }
            },
            template: {
              name: 'Sales_Top5Items',
            },
            footer: {
              show: false
            }
          },
          {
            order: 5,
            show: true,
            allow: true,
            parentClass: 'sales',
            customClass: 'section_1 ',
            config: {
              useConfig: true,
              width: 50,
              widthUnit: '%',
              height: '455',
              heightUnit: 'px'
            },
            title: {
              show: true,
              icon: {
                show: true,
                path: 'icon-revenue2'
              },
              title: this.captions.topFiveCategory,
              multiSelect: {
                show: true,
                multiSelectData: [
                  { description: this.captions.DAY, id: 1, name: this.captions.DAY, selected: true },
                  { description: this.captions.WEEK, id: 2, name: this.captions.WEEK, selected: false },
                  { description: this.captions.MONTH, id: 3, name: this.captions.MONTH, selected: false }
                ]
              },
              dropDown: {
                show: true,
                placeholder: this.captions.Outlets,
                floatLabel: 'never',
                dropDownControlname: 'Sales_Top5Categories',
                dropDownName: this.captions.allOutlets,
                defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                dropDownOptions: this.OutletsData,
              }
            },
            template: {
              name: 'Sales_Top5Categories'
            },
            footer: {
              show: false
            }
          },
         
          {
            order: 7,
            show: true,
            allow: true,
            parentClass: 'sales',
            customClass: 'section_1 ',
            config: {
              useConfig: true,
              width: 40,
              widthUnit: '%',
              height: '455',
              heightUnit: 'px'
            },
            title: {
              show: true,
              icon: {
                show: false
              },
              title: this.captions.OpenTickets,
              multiSelect: {
                show: false
              },
              dropDown: {
                show: true,
                placeholder: this.captions.Outlets,
                floatLabel: 'never',
                dropDownControlname: 'Open_Tickets',
                dropDownName: this.captions.allOutlets,
                defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                dropDownOptions: this.OutletsData,
              }
            },
            template: {
              name: 'Open_Tickets'
            },
            footer: {
              show: true,
              title: this.captions.ViewCompleteList,
              showArrow: true,
              routingPath: 'shop/viewshop/retailtransactions/opentransactions'
            }
          },
          {
            order: 8,
            show: true,
            allow: true,
            parentClass: 'sales',
            customClass: 'section_1',
            config: {
              useConfig: true,
              width: 60,
              widthUnit: '%',
              height: '455',
              heightUnit: 'px'
            },
            title: {
              show: true,
              icon: {
                show: false
              },
              title: this.captions.ReturnedItems,
              multiSelect: {
                show: true,
                multiSelectData: [
                  { description: this.captions.DAY, id: 1, name: this.captions.DAY, selected: true },
                  { description: this.captions.WEEK, id: 2, name: this.captions.WEEK, selected: false },
                  { description: this.captions.MONTH, id: 3, name: this.captions.MONTH, selected: false }
                ]
              },
              dropDown: {
                show: true,
                placeholder: this.captions.Outlets,
                floatLabel: 'never',
                dropDownControlname: 'Returned_Items',
                dropDownName: this.captions.allOutlets,
                defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                dropDownOptions: this.OutletsData,
              }
            },
            template: {
              name: 'Returned_Items'
            },
            footer: {
              show: false
            }
          }
        ]
      }
    ];
  }

  getDashBoardWidget() {

    return this.DashBoardwidgetsData = [
      {
        widgetWrapper: {
          title: this.captions.dashBoardTitle ,
          icon: {
            show: false,
            path: 'icon-name'
          },
          dropDown: {
            show: true,
            placeholder: this.captions.Outlets ,
            floatLabel: 'never',
            dropDownControlname: 'dashBoardHeadOutlet',
            dropDownName: this.captions.allOutlets,
            defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
            dropDownOptions: this.OutletsData,
          },
          manage: {
            show: true,
            title: 'Manage',
            innerTitle: 'Manage Courses'
          }
        },
        widget: [
          {
            show: true,
            parentClass: 'sales',
            hasInnerComponent: false,
            config: {
              useConfig: true,
              width: 32,
              widthUnit: '%',
              height: '350',
              heightUnit: 'px'
            },
            template: {
              name: 'DB_OultetsChart',
              // templateData: {
              //   data: {
              //     series:[7,11],
              //     captions:{
              //       courses:this.captions.courses,
              //       courseStatus:this.captions.courseStatus,
              //       activeCourses:this.captions.activeCourses,
              //       inactiveCourses:this.captions.inactiveCourses
              //     }
              //   }

              // }
            }
          },
          {
            show: true,
            hasInnerComponent: true,
            customClass: 'widgetInnerComponent',
            innerComponent: [
              {
                config: {
                  useConfig: true,
                  width: 100,
                  widthUnit: '%',
                  height: '46',
                  heightUnit: '%',
                  customClass: 'dbBlock_2_1',
                },
                template: {
                  name: 'DB_TotalSalesRevenue'
                }
              },
              {
                config: {
                  useConfig: true,
                  width: 48,
                  widthUnit: '%',
                  height: '47',
                  heightUnit: '%',
                  customClass: 'dbBlock_2_3',
                },
                template: {
                  name: 'DB_AverageTransaction',
                  // templateData: {
                  //   data:{
                  //     icon:'icon-player',
                  //     count:this.NewPlayers,
                  //     description:this.captions.DB_AverageTransaction
                  //   }
                  // }
                }
              },
              {
                config: {
                  useConfig: true,
                  width: 48,
                  widthUnit: '%',
                  height: '47',
                  heightUnit: '%',
                  customClass: 'dbBlock_2_2',
                },
                template: {
                  name: 'DB_NumberOfTransaction',
                  // templateData: {
                  //   data:{
                  //     icon:'icon-player',
                  //     count:this.CancelledTeeTimesCount,
                  //     description:this.captions.DB_NumberOfTransaction
                  //   }
                  // }
                }
              }
              // ,{
              //   config: {
              //     useConfig: true,
              //     width: 48,
              //     widthUnit: '%',
              //     height: '47',
              //     heightUnit: '%',
              //     customClass: "dbBlock_2_4",
              //   },
              //   template: {
              //     name: 'DB_AvgUnitPerCustomer',
                  // templateData: {
                  //   data: {
                  //     icon:'icon-player',
                  //     count:this.RepeatPlayers,
                  //     description:this.captions.DB_AvgUnitPerCustomer
                  //   }
                  // }
                // }
              // }
            ],
            config: {
              useConfig: true,
              width: 33,
              widthUnit: '%',
              height: '350',
              heightUnit: 'px'
            }

          },
          {
            show: true,
            hasInnerComponent: false,
            config: {
              useConfig: true,
              width: 33,
              widthUnit: '%',
              height: '350',
              heightUnit: 'px'
            },
            template: {
              name: 'DB_VendorsChart',
              // templateData: {
              //   data: [
              //     { id: 1, value: "DB_VendorsChart" }
              //   ]
              // }
            }
          }
        ]
      }
    ];
  }

  getTeeSheeetID() {
    return {
        tableID: 'TableDashboard'
    };
  }

  getTeeSheetCustomTableData() {
      return {
          isMultiView: false,
          isShowAvailableOnly: true,
          isHideCrossover: true,
          isDetailView: false,
          isOrderByHoleTime: true,
          isHoleNotificationEnabled: true,
          isCommentNotificationEnabled: false,
          isActionAvailable: true,
          isMenuEnabledOnEllipsis: true,
          isPlayerDetailIconsEnabled: false,
          isDragDisabled: true,
          isTooltipDisabled: true,
          isResetDisabled: true,
          isResetHidden: true
      };
  }


   /**
   *
   * @param countryCode
   */
    async getCountryName(countryCode) {  
      let myMap = new Map<string, string>([
         ['Afghanistan','AF']
        ,['Aland Islands','AX']
        ,['Albania','AL']
        ,['Algeria','DZ']
        ,['American Samoa','AS']
        ,['Andorra','AD']
        ,['Angola','AO']
        ,['Anguilla','AI']
        ,['Antarctica','AQ']
        ,['Antigua And Barbuda','AG']
        ,['Argentina','AR']
        ,['Armenia','AM']
        ,['Aruba','AW']
        ,['Australia','AU']
        ,['Austria','AT']
        ,['Azerbaijan','AZ']
        ,['Bahamas','BS']
        ,['Bahrain','BH']
        ,['Bangladesh','BD']
        ,['Barbados','BB']
        ,['Belarus','BY']
        ,['Belgium','BE']
        ,['Belize','BZ']
        ,['Benin','BJ']
        ,['Bermuda','BM'] 
        ,['Bhutan','BT']
        ,['Bolivia','BO']
        ,['Bosnia And Herzegovina','BA']
        ,['Botswana','BW']
        ,['Bouvet Island','BV']
        ,['Brazil','BR']
        ,['British Indian Ocean Territory','IO']
        ,['Brunei Darussalam','BN']
        ,['Bulgaria','BG']
        ,['Burkina Faso','BF']
        ,['Burundi','BI']
        ,['Cambodia','KH']
        ,['Cameroon','CM']
        ,['Canada','CA']
        ,['Cape Verde','CV']
        ,['Cayman Islands','KY']
        ,['Central African Republic','CF']
        ,['Chad','TD']
        ,['Chile','CL']
        ,['China','CN']
        ,['Christmas Island','CX']
        ,['Cocos (Keeling) Islands','CC']
        ,['Colombia','CO']
        ,['Comoros','KM']
        ,['Congo','CG']
        ,['Congo, Democratic Republic','CD']
        ,['Cook Islands','CK']
        ,['Costa Rica','CR']
        ,['Cote D\'Ivoire','CI']
        ,['Croatia','HR']
        ,['Cuba','CU']
        ,['Cyprus','CY']
        ,['Czech Republic','CZ']
        ,['Denmark','DK']
        ,['Djibouti','DJ']
        ,['Dominica','DM']
        ,['Dominican Republic','DO']
        ,['Ecuador','EC']
        ,['Egypt','EG']
        ,['El Salvador','SV']
        ,['Equatorial Guinea','GQ']
        ,['Eritrea','ER']
        ,['Estonia','EE']
        ,['Ethiopia','ET']
        ,['Falkland Islands (Malvinas)','FK']
        ,['Faroe Islands','FO']
        ,['Fiji','FJ']
        ,['Finland','FI']
        ,['France','FR']
        ,['French Guiana','GF']
        ,['French Polynesia','PF']
        ,['French Southern Territories','TF']
        ,['Gabon','GA']
        ,['Gambia','GM']
        ,['Georgia','GE']
        ,['Germany','DE']
        ,['Ghana','GH']
        ,['Gibraltar','GI']
        ,['Greece','GR']
        ,['Greenland','GL']
        ,['Grenada','GD']
        ,['Guadeloupe','GP']
        ,['Guam','GU']
        ,['Guatemala','GT']
        ,['Guernsey','GG']
        ,['Guinea','GN']
        ,['Guinea-Bissau','GW']
        ,['Guyana','GY']
        ,['Haiti','HT']
        ,['Heard Island & Mcdonald Islands','HM']
        ,['Holy See (Vatican City State)','VA']
        ,['Honduras','HN']
        ,['Hong Kong','HK']
        ,['Hungary','HU']
        ,['Iceland','IS']
        ,['India','IN']
        ,['Indonesia','ID']
        ,['Iran, Islamic Republic Of','IR']
        ,['Iraq','IQ']
        ,['Ireland','IE']
        ,['Isle Of Man','IM']
        ,['Israel','IL']
        ,['Italy','IT']
        ,['Jamaica','JM']
        ,['Japan','JP']
        ,['Jersey','JE']
        ,['Jordan','JO']
        ,['Kazakhstan','KZ']
        ,['Kenya','KE']
        ,['Kiribati','KI']
        ,['Korea','KR']
        ,['Kuwait','KW']
        ,['Kyrgyzstan','KG']
        ,['Lao People\'s Democratic Republic','LA']
        ,['Latvia','LV']
        ,['Lebanon','LB']
        ,['Lesotho','LS']
        ,['Liberia','LR']
        ,['Libyan Arab Jamahiriya','LY']
        ,['Liechtenstein','LI']
        ,['Lithuania','LT']
        ,['Luxembourg','LU']
        ,['Macao','MO']
        ,['Macedonia','MK']
        ,['Madagascar','MG']
        ,['Malawi','MW']
        ,['Malaysia','MY']
        ,['Maldives','MV']
        ,['Mali','ML']
        ,['Malta','MT']
        ,['Marshall Islands','MH']
        ,['Martinique','MQ']
        ,['Mauritania','MR']
        ,['Mauritius','MU']
        ,['Mayotte','YT']
        ,['Mexico','MX']
        ,['Micronesia, Federated States Of','FM']
        ,['Moldova','MD']
        ,['Monaco','MC']
        ,['Mongolia','MN']
        ,['Montenegro','ME']
        ,['Montserrat','MS']
        ,['Morocco','MA']
        ,['Mozambique','MZ']
        ,['Myanmar','MM']
        ,['Namibia','NA']
        ,['Nauru','NR']
        ,['Nepal','NP']
        ,['Netherlands','NL']
        ,['Netherlands Antilles','AN']
        ,['New Caledonia','NC']
        ,['New Zealand','NZ']
        ,['Nicaragua','NI']
        ,['Niger','NE']
        ,['Nigeria','NG']
        ,['Niue','NU']
        ,['Norfolk Island','NF']
        ,['Northern Mariana Islands','MP']
        ,['Norway','NO']
        ,['Oman','OM']
        ,['Pakistan','PK']
        ,['Palau','PW']
        ,['Palestinian Territory, Occupied','PS']
        ,['Panama','PA']
        ,['Papua New Guinea','PG']
        ,['Paraguay','PY']
        ,['Peru','PE']
        ,['Philippines','PH']
        ,['Pitcairn','PN']
        ,['Poland','PL']
        ,['Portugal','PT']
        ,['Puerto Rico','PR']
        ,['Qatar','QA']
        ,['Reunion','RE']
        ,['Romania','RO']
        ,['Russian Federation','RU']
        ,['Rwanda','RW']
        ,['Saint Barthelemy','BL']
        ,['Saint Helena','SH']
        ,['Saint Kitts And Nevis','KN']
        ,['Saint Lucia','LC']
        ,['Saint Martin','MF']
        ,['Saint Pierre And Miquelon','PM']
        ,['Saint Vincent And Grenadines','VC']
        ,['Samoa','WS']
        ,['San Marino','SM']
        ,['Sao Tome And Principe','ST']
        ,['Saudi Arabia','SA']
        ,['Senegal','SN']
        ,['Serbia','RS']
        ,['Seychelles','SC']
        ,['Sierra Leone','SL']
        ,['Singapore','SG']
        ,['Slovakia','SK']
        ,['Slovenia','SI']
        ,['Solomon Islands','SB']
        ,['Somalia','SO']
        ,['South Africa','ZA']
        ,['South Georgia And Sandwich Isl.','GS']
        ,['Spain','ES']
        ,['Sri Lanka','LK']
        ,['Sudan','SD']
        ,['Suriname','SR']
        ,['Svalbard And Jan Mayen','SJ']
        ,['Swaziland','SZ']
        ,['Sweden','SE']
        ,['Switzerland','CH']
        ,['Syrian Arab Republic','SY']
        ,['Taiwan','TW']
        ,['Tajikistan','TJ']
        ,['Tanzania','TZ']
        ,['Thailand','TH']
        ,['Timor-Leste','TL']
        ,['Togo','TG']
        ,['Tokelau','TK']
        ,['Tonga','TO']
        ,['Trinidad And Tobago','TT']
        ,['Tunisia','TN']
        ,['Turkey','TR']
        ,['Turkmenistan','TM']
        ,['Turks And Caicos Islands','TC']
        ,['Tuvalu','TV']
        ,['Uganda','UG']
        ,['Ukraine','UA']
        ,['United Arab Emirates','AE']
        ,['United Kingdom','GB']
        ,['United States','US']   
        ,['United States of America','US']    
        ,['United States Outlying Islands','UM']
        ,['Uruguay','UY']
        ,['Uzbekistan','UZ']
        ,['Vanuatu','VU']
        ,['Venezuela','VE']
        ,['Viet Nam','VN']
        ,['Virgin Islands, British','VG']
        ,['Virgin Islands, U.S.','VI']
        ,['Wallis And Futuna','WF']
        ,['Western Sahara','EH']
        ,['Yemen','YE']
        ,['Zambia','ZM']
        ,['Zimbabwe','ZW']
       ]);
        let countryAbbr = myMap.get(countryCode),returnValue;    
        if(countryAbbr){  
          returnValue ={message:countryAbbr,status:'s',};  
        }else{
          returnValue ={message:this.captions.countryNotFound,status:'e'};
        }   
        return returnValue; 
      }
}

