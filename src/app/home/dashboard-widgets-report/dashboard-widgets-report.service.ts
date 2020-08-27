import { Injectable } from '@angular/core';
// import { CourseOption } from 'src/app/settings/rate-setup/rate-setup.model';
import { OutletOption } from './dashboard.modal';
// import { Filter } from 'src/app/shared/shared-models';
import { DashBoardBusiness } from './dashboard-business';
import { Localization } from 'src/app/core/localization/Localization';

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


  constructor(private localization: Localization) {
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
            placeholder: 'Outlets',
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
                show: true,
                placeholder: 'Outlets',
                floatLabel: 'never',
                dropDownControlname: 'Sales_Revenue',
                dropDownName: this.captions.allOutlets,
                defaultData: {id: 0, value: 'ALL', description: this.captions.allOutlets, showInDropDown: true},
                dropDownOptions: this.OutletsData,
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
                placeholder: 'Outlets',
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
              routingPath: ''
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
                placeholder: 'Outlets',
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
                placeholder: 'Outlets',
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
                placeholder: 'Outlets',
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
          // {
          //   order:6,
          //   show: true,
          //   allow:true,
          //   parentClass:'sales',
          //   customClass:'section_1 ',
          //   config: {
          //     useConfig: true,
          //     width: 50,
          //     widthUnit: '%',
          //     height: '455',
          //     heightUnit: 'px'
          //   },
          //   title: {
          //     show: true,
          //     icon: {
          //       show: false
          //     },
          //     title: this.captions.PurchaseOrder,
          //     multiSelect: {
          //       show: false
          //     },
          //     dropDown: {
          //       show: true,
          //       placeholder: 'Outlets',
          //       floatLabel: 'never',
          //       dropDownControlname:'Purchase_Order',
          //       dropDownName: this.captions.allOutlets,
          //       defaultData:{id: 0, value: 'ALL', description: this.captions.allOutlets,showInDropDown: true},
          //       dropDownOptions: this.OutletsData,
          //     },
          //   },
          //   template: {
          //     name: 'Purchase_Order'
          //   },
          //   footer: {
          //     show: true,
          //     title: this.captions.ViewCompleteList,
          //     showArrow: true,
          //     routingPath:''
          //   }
          // },
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
                placeholder: 'Outlets',
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
              routingPath: ''
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
                placeholder: 'Outlets',
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
            placeholder: 'Courses',
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
  const isoCountries = {
    'AF' : 'Afghanistan',
    'AX' : 'Aland Islands',
    'AL' : 'Albania',
    'DZ' : 'Algeria',
    'AS' : 'American Samoa',
    'AD' : 'Andorra',
    'AO' : 'Angola',
    'AI' : 'Anguilla',
    'AQ' : 'Antarctica',
    'AG' : 'Antigua And Barbuda',
    'AR' : 'Argentina',
    'AM' : 'Armenia',
    'AW' : 'Aruba',
    'AU' : 'Australia',
    'AT' : 'Austria',
    'AZ' : 'Azerbaijan',
    'BS' : 'Bahamas',
    'BH' : 'Bahrain',
    'BD' : 'Bangladesh',
    'BB' : 'Barbados',
    'BY' : 'Belarus',
    'BE' : 'Belgium',
    'BZ' : 'Belize',
    'BJ' : 'Benin',
    'BM' : 'Bermuda',
    'BT' : 'Bhutan',
    'BO' : 'Bolivia',
    'BA' : 'Bosnia And Herzegovina',
    'BW' : 'Botswana',
    'BV' : 'Bouvet Island',
    'BR' : 'Brazil',
    'IO' : 'British Indian Ocean Territory',
    'BN' : 'Brunei Darussalam',
    'BG' : 'Bulgaria',
    'BF' : 'Burkina Faso',
    'BI' : 'Burundi',
    'KH' : 'Cambodia',
    'CM' : 'Cameroon',
    'CA' : 'Canada',
    'CV' : 'Cape Verde',
    'KY' : 'Cayman Islands',
    'CF' : 'Central African Republic',
    'TD' : 'Chad',
    'CL' : 'Chile',
    'CN' : 'China',
    'CX' : 'Christmas Island',
    'CC' : 'Cocos (Keeling) Islands',
    'CO' : 'Colombia',
    'KM' : 'Comoros',
    'CG' : 'Congo',
    'CD' : 'Congo, Democratic Republic',
    'CK' : 'Cook Islands',
    'CR' : 'Costa Rica',
    'CI' : 'Cote D\'Ivoire',
    'HR' : 'Croatia',
    'CU' : 'Cuba',
    'CY' : 'Cyprus',
    'CZ' : 'Czech Republic',
    'DK' : 'Denmark',
    'DJ' : 'Djibouti',
    'DM' : 'Dominica',
    'DO' : 'Dominican Republic',
    'EC' : 'Ecuador',
    'EG' : 'Egypt',
    'SV' : 'El Salvador',
    'GQ' : 'Equatorial Guinea',
    'ER' : 'Eritrea',
    'EE' : 'Estonia',
    'ET' : 'Ethiopia',
    'FK' : 'Falkland Islands (Malvinas)',
    'FO' : 'Faroe Islands',
    'FJ' : 'Fiji',
    'FI' : 'Finland',
    'FR' : 'France',
    'GF' : 'French Guiana',
    'PF' : 'French Polynesia',
    'TF' : 'French Southern Territories',
    'GA' : 'Gabon',
    'GM' : 'Gambia',
    'GE' : 'Georgia',
    'DE' : 'Germany',
    'GH' : 'Ghana',
    'GI' : 'Gibraltar',
    'GR' : 'Greece',
    'GL' : 'Greenland',
    'GD' : 'Grenada',
    'GP' : 'Guadeloupe',
    'GU' : 'Guam',
    'GT' : 'Guatemala',
    'GG' : 'Guernsey',
    'GN' : 'Guinea',
    'GW' : 'Guinea-Bissau',
    'GY' : 'Guyana',
    'HT' : 'Haiti',
    'HM' : 'Heard Island & Mcdonald Islands',
    'VA' : 'Holy See (Vatican City State)',
    'HN' : 'Honduras',
    'HK' : 'Hong Kong',
    'HU' : 'Hungary',
    'IS' : 'Iceland',
    'IN' : 'India',
    'ID' : 'Indonesia',
    'IR' : 'Iran, Islamic Republic Of',
    'IQ' : 'Iraq',
    'IE' : 'Ireland',
    'IM' : 'Isle Of Man',
    'IL' : 'Israel',
    'IT' : 'Italy',
    'JM' : 'Jamaica',
    'JP' : 'Japan',
    'JE' : 'Jersey',
    'JO' : 'Jordan',
    'KZ' : 'Kazakhstan',
    'KE' : 'Kenya',
    'KI' : 'Kiribati',
    'KR' : 'Korea',
    'KW' : 'Kuwait',
    'KG' : 'Kyrgyzstan',
    'LA' : 'Lao People\'s Democratic Republic',
    'LV' : 'Latvia',
    'LB' : 'Lebanon',
    'LS' : 'Lesotho',
    'LR' : 'Liberia',
    'LY' : 'Libyan Arab Jamahiriya',
    'LI' : 'Liechtenstein',
    'LT' : 'Lithuania',
    'LU' : 'Luxembourg',
    'MO' : 'Macao',
    'MK' : 'Macedonia',
    'MG' : 'Madagascar',
    'MW' : 'Malawi',
    'MY' : 'Malaysia',
    'MV' : 'Maldives',
    'ML' : 'Mali',
    'MT' : 'Malta',
    'MH' : 'Marshall Islands',
    'MQ' : 'Martinique',
    'MR' : 'Mauritania',
    'MU' : 'Mauritius',
    'YT' : 'Mayotte',
    'MX' : 'Mexico',
    'FM' : 'Micronesia, Federated States Of',
    'MD' : 'Moldova',
    'MC' : 'Monaco',
    'MN' : 'Mongolia',
    'ME' : 'Montenegro',
    'MS' : 'Montserrat',
    'MA' : 'Morocco',
    'MZ' : 'Mozambique',
    'MM' : 'Myanmar',
    'NA' : 'Namibia',
    'NR' : 'Nauru',
    'NP' : 'Nepal',
    'NL' : 'Netherlands',
    'AN' : 'Netherlands Antilles',
    'NC' : 'New Caledonia',
    'NZ' : 'New Zealand',
    'NI' : 'Nicaragua',
    'NE' : 'Niger',
    'NG' : 'Nigeria',
    'NU' : 'Niue',
    'NF' : 'Norfolk Island',
    'MP' : 'Northern Mariana Islands',
    'NO' : 'Norway',
    'OM' : 'Oman',
    'PK' : 'Pakistan',
    'PW' : 'Palau',
    'PS' : 'Palestinian Territory, Occupied',
    'PA' : 'Panama',
    'PG' : 'Papua New Guinea',
    'PY' : 'Paraguay',
    'PE' : 'Peru',
    'PH' : 'Philippines',
    'PN' : 'Pitcairn',
    'PL' : 'Poland',
    'PT' : 'Portugal',
    'PR' : 'Puerto Rico',
    'QA' : 'Qatar',
    'RE' : 'Reunion',
    'RO' : 'Romania',
    'RU' : 'Russian Federation',
    'RW' : 'Rwanda',
    'BL' : 'Saint Barthelemy',
    'SH' : 'Saint Helena',
    'KN' : 'Saint Kitts And Nevis',
    'LC' : 'Saint Lucia',
    'MF' : 'Saint Martin',
    'PM' : 'Saint Pierre And Miquelon',
    'VC' : 'Saint Vincent And Grenadines',
    'WS' : 'Samoa',
    'SM' : 'San Marino',
    'ST' : 'Sao Tome And Principe',
    'SA' : 'Saudi Arabia',
    'SN' : 'Senegal',
    'RS' : 'Serbia',
    'SC' : 'Seychelles',
    'SL' : 'Sierra Leone',
    'SG' : 'Singapore',
    'SK' : 'Slovakia',
    'SI' : 'Slovenia',
    'SB' : 'Solomon Islands',
    'SO' : 'Somalia',
    'ZA' : 'South Africa',
    'GS' : 'South Georgia And Sandwich Isl.',
    'ES' : 'Spain',
    'LK' : 'Sri Lanka',
    'SD' : 'Sudan',
    'SR' : 'Suriname',
    'SJ' : 'Svalbard And Jan Mayen',
    'SZ' : 'Swaziland',
    'SE' : 'Sweden',
    'CH' : 'Switzerland',
    'SY' : 'Syrian Arab Republic',
    'TW' : 'Taiwan',
    'TJ' : 'Tajikistan',
    'TZ' : 'Tanzania',
    'TH' : 'Thailand',
    'TL' : 'Timor-Leste',
    'TG' : 'Togo',
    'TK' : 'Tokelau',
    'TO' : 'Tonga',
    'TT' : 'Trinidad And Tobago',
    'TN' : 'Tunisia',
    'TR' : 'Turkey',
    'TM' : 'Turkmenistan',
    'TC' : 'Turks And Caicos Islands',
    'TV' : 'Tuvalu',
    'UG' : 'Uganda',
    'UA' : 'Ukraine',
    'AE' : 'United Arab Emirates',
    'GB' : 'United Kingdom',
    'US' : 'United States',
    'UM' : 'United States Outlying Islands',
    'UY' : 'Uruguay',
    'UZ' : 'Uzbekistan',
    'VU' : 'Vanuatu',
    'VE' : 'Venezuela',
    'VN' : 'Viet Nam',
    'VG' : 'Virgin Islands, British',
    'VI' : 'Virgin Islands, U.S.',
    'WF' : 'Wallis And Futuna',
    'EH' : 'Western Sahara',
    'YE' : 'Yemen',
    'ZM' : 'Zambia',
    'ZW' : 'Zimbabwe'
  };

    let countryAbbr = Object.keys(isoCountries).find(key => isoCountries[key].toLowerCase() === countryCode.toLowerCase()), returnValue;
  if (countryAbbr) {
      returnValue = {message: countryAbbr, status: 's', };
    } else {
      returnValue = {message: this.captions.countryNotFound, status: 'e'};
    }
  return returnValue;
  }





}

