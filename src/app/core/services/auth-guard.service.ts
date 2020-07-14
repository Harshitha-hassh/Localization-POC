import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JWT_TOKEN, PROPERTY_DATE } from '../app-constants';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {

    constructor(private router: Router) { }

    canActivate(): boolean | Promise<boolean> {
        
        let jwt = sessionStorage.getItem(JWT_TOKEN);
        let propertyDate = sessionStorage.getItem(PROPERTY_DATE);
        
        if ( jwt != "null" && jwt != "undefined" && jwt != undefined && propertyDate != null) {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }

}
