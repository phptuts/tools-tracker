import 'jasmine';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../providers/auth.service';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationExtras, Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';


describe('Auth Guard', () => {

    let authGuard: AuthGuard;

    let user: any;

    class MockAuthService implements Partial<AuthService> {
        public readonly user$ = of(undefined).pipe(map(() => user));
    }

    const router: Partial<Router>|any = {
        navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
            return Promise.resolve(true);
        }
    };

    const activatedRoute: any = {};
    const routerState: any = {};

    let routerSpy: jasmine.Spy;

    const authService: any = new MockAuthService();


    beforeEach(() => {

        routerSpy = spyOn(router, 'navigate')
            .and.returnValue(of(true));

        authGuard = new AuthGuard(authService, router);
    });

    it('should redirect to login page and return false if not logged in', fakeAsync(() => {

        user = undefined;

        authGuard
            .canActivate(activatedRoute, routerState)
            .subscribe(loggedIn => {
                expect(loggedIn).toBeFalsy();
            });

        tick(1);

        expect(routerSpy).toHaveBeenCalledWith(['login']);

    }));

    it('should return true if login in', fakeAsync(() => {
        user = {
            'email': 'email@gmail.com'
        };



        authGuard
            .canActivate(activatedRoute, routerState)
            .subscribe(loggedIn => {
                expect(loggedIn).toBeTruthy();
            });

        tick(1);

        expect(routerSpy).not.toHaveBeenCalled();

    }));

});
