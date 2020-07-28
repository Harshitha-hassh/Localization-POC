import { Injectable } from "@angular/core";
import { DataAwaiterService } from './shared/service/awaiters/data.awaiter.service';

@Injectable()
export class AppBusiness {
    constructor(private _setDataAwaiters: DataAwaiterService
    ) {
        // _retailEventSubscriber.start(); Add subscriber start if needed 
    }
}