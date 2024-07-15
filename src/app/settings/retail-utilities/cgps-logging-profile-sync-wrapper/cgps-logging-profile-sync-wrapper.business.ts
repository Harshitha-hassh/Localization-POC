import { Injectable } from "@angular/core";

import {API,UI} from "src/app/settings/retail-utilities/cgps-logging-profile-sync-wrapper/cgps-logging-profile-sync-wrapper.model"
import { ActionTypeEnum, SorTypeEnum } from 'src/app/common/components/cdkvirtual/cdkvirtual.model';
import { TableActions } from 'src/app/common/enums/shared-enums';
import { Localization } from "src/app/common/localization/localization";
import { CgpsLoggingProfileSyncWrapperDataService } from "src/app/shared/data-services/cgps-logging-profile-sync-wrapper.data.service";

@Injectable()
export class CgpsLoggingProfileSyncWrapperBusiness{
    captions: any;
    isViewOnly: any;
    constructor(private localization: Localization, private _dataService : CgpsLoggingProfileSyncWrapperDataService){
        this.captions = this.localization.captions
    }

    public async GetFailedProfile() : Promise<UI.FailedProfile[]>
    {
        let apiModels : API.FailedProfile[] = await this._dataService.getFailedProfile();
        return apiModels.map(x => this.UIMapper(x)); 
    }

    public DateRangeProfileSync(StartDate : any, EndDate : any)
    {
        return this._dataService.DateRangeProfileSync(this.APIMapper(StartDate,EndDate));
    }

    public singleProfileSync(guestId : any, syncDirection : number)
    {
        return this._dataService.SingleProfileSync(this.APIMapper('','',guestId,syncDirection));
    }
    private UIMapper(apiModel : API.FailedProfile) : UI.FailedProfile
    {
      return {
              lastName: apiModel.guestLastName,
              firstName: apiModel.guestFirstName,
              description: apiModel.failureReason,
              retryCount: apiModel.retryCount.toString(),
              guestId: apiModel.guestId,
              syncDirection: apiModel.syncDirection,
              sync: ''
        } as UI.FailedProfile
    }

    APIMapper(StartDate : any, EndDate : any, guestId: any = '',syncDirection = 0) : API.ProfileSyncInfo
    {
        return{
            startDate : StartDate !== "" ? this.localization.convertDateToAPIdate(new Date(StartDate)) : '',
            enddate : EndDate !== "" ? this.localization.convertDateToAPIdate(new Date(EndDate)) : '',
            guestId : guestId,  
            syncDirection : syncDirection
        }
    }

    public async getClientInfoByGuid(guestId) {
      return await this._dataService.getClientInfobyGuid(guestId);
    }

   

    public getHeaderOptions()
    {
        return[
            {
              key: 'lastName',
              displayNameId: 'lastName',
              displayName: this.captions.lbl_lastName ,
              sortingKey: 'lastName'
            },
            {
              key: 'firstName',
              displayNameId: 'firstName',
              displayName: this.captions.lbl_firstName ,
              sortingKey: 'firstName'
            },
            {
              key: 'description',
              displayNameId: 'tbl_hdr_description',
              displayName: this.captions.tbl_hdr_description ,
              sortingKey: 'description'
            },
            {
              key: 'retryCount',
              displayNameId: 'lbl_retryCount',
              displayName: this.captions.lbl_retryCount ,
              sortingKey: 'retryCount'
            },
            {
              key: 'sync',
              displayNameId: 'btn_sync',
              displayName: this.captions.EditClient,
              sortingKey: 'sync',
              templateName: ActionTypeEnum.custom
            },
            {
              key: ActionTypeEnum.action,
              displayName: this.captions.tbl_hdr_actions,
              searchable: false,
              templateName: ActionTypeEnum.action
            }
          ]
    }

    public getTableOptions()
    {
        return{
            actions: [
                {
                  type: TableActions.sync,
                  disabled: this.isViewOnly
              }
              ],
              defaultsortingColoumnKey: 'lastName',
              showTotalRecords: false,
              defaultSortOrder: SorTypeEnum.asc,
              columnFreeze: {
                firstColumn: false,
                lastColumn: false
              },
              isDragDisabled: false,
              isHeaderCheckboxAllowed: true,
              checkboxKey: 'checked',
              ignoreSort: true
        }
    }

    }

