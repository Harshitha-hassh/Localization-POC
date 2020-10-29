import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class DeactivateGuard implements CanDeactivate<CanComponentDeactivate>{
  canDeactivate(component: CanComponentDeactivate,
                route:  ActivatedRouteSnapshot,
                state: RouterStateSnapshot){
                  return component.canDeactivate ? component.canDeactivate() : true;
  }
}

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | boolean;
}