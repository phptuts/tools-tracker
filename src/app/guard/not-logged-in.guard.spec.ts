import 'jasmine';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../providers/auth.service';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationExtras, Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';
import { NotLoggedInGuard } from './not-logged-in.guard';


describe('Not Logged In Guard', () => {

    let notLoggedInGuard: NotLoggedInGuard;

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

        notLoggedInGuard = new NotLoggedInGuard(authService, router);
    });

    it('should return true if the user is not logged in', fakeAsync(() => {

        user = undefined;

        notLoggedInGuard
            .canActivate(activatedRoute, routerState)
            .subscribe(notLoggedIn => {
                expect(notLoggedIn).toBeTruthy();
            });

        tick(1);

        expect(routerSpy).not.toHaveBeenCalled();

    }));

    it('should return false if the user is logged in', fakeAsync(() => {
        user = {
            'email': 'email@gmail.com'
        };



        notLoggedInGuard
            .canActivate(activatedRoute, routerState)
            .subscribe(notLoggedIn => {
                expect(notLoggedIn).toBeFalsy();
            });

        tick(1);

        expect(routerSpy).toHaveBeenCalledWith(['']);

    }));

});
