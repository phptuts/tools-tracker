import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app-routing.module';
import { AuthService } from '../../providers/auth.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HomeComponent } from '../home/home.component';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    const authService: Partial<AuthService> = {
        signIn(email: string, password: string): Promise<string | undefined> {
            return Promise.resolve(undefined);
        }
    };

    let authServiceSpy: jasmine.Spy;

    const router: Partial<Router> = {
        navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
            return Promise.resolve(true);
        }
    };

    let routerSpy: jasmine.Spy;

    let errorMessage: undefined | string;

    beforeEach(async(() => {

        routerSpy = spyOn(router, 'navigate')
            .and.returnValue(Promise.resolve(true));

        authServiceSpy = spyOn(authService, 'signIn')
            .and.callFake(() => Promise.resolve(errorMessage));

        TestBed.configureTestingModule({
            declarations: [ LoginComponent, HomeComponent ],
            providers: [
                {
                    provide: AuthService,
                    useValue: authService
                },
                {
                    provide: Router,
                    useValue: router
                }
            ],
            imports: [ FormsModule, ReactiveFormsModule ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should submit be able to submit and navigate to the next page', fakeAsync(() => {

        errorMessage = undefined;
        component.form.get('email').setValue('good@gmail.com');
        component.form.get('password').setValue('password');
        component.form.updateValueAndValidity();

        component.submit();
        tick(1);

        expect(routerSpy).toHaveBeenCalledWith([ 'tools' ]);
        expect(authServiceSpy).toHaveBeenCalledWith('good@gmail.com', 'password');
        expect(component[ 'errorMessage' ]).toBe(undefined);
    }));

    it('should display error message if the form comes back with an error', fakeAsync(() => {

        errorMessage = 'There was an error.';
        component.form.get('email').setValue('bad@gmail.com');
        component.form.get('password').setValue('password');
        component.form.updateValueAndValidity();

        component.submit();
        tick(1);

        expect(routerSpy).not.toHaveBeenCalledWith([ 'tools' ]);
        expect(authServiceSpy).toHaveBeenCalledWith('bad@gmail.com', 'password');
        expect(component[ 'errorMessage' ]).toBe('There was an error.');
    }));
});
