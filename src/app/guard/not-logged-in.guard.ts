import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../providers/auth.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class NotLoggedInGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree>  {

        return this.authService.user$
            .pipe(
                map(user => user === undefined),
                tap(userLoggedIn => {
                    if (!userLoggedIn) {
                        this.router.navigate(['']);
                    }
                })
            );
    }

}
