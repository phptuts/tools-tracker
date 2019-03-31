import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password.component';
import { Observable, of } from 'rxjs';
import { LoginComponent } from '../login/login.component';
import { HomeComponent } from '../home/home.component';
import { AuthService } from '../../providers/auth.service';
import { NavigationExtras, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  const authService: Partial<AuthService> = {
    forgetPassword(email: string): Observable<string | undefined> {
      return of(undefined);
    }
  };

  const router: Partial<Router> = {
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
      return Promise.resolve(true);
    }
  };

  let routerSpy: jasmine.Spy;

  let errorMessage: undefined|string;

  let authServiceSpy: jasmine.Spy;


  beforeEach(async(() => {

    routerSpy = spyOn(router, 'navigate')
        .and.returnValue(of(true));

    authServiceSpy = spyOn(authService, 'forgetPassword')
        .and.callFake(() => of(errorMessage));

    TestBed.configureTestingModule({
      declarations: [ ForgotPasswordComponent ],
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
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit be able to submit and navigate to the next page', fakeAsync(() => {

    errorMessage = undefined;
    component.form.get('email').setValue('good@gmail.com');
    component.form.updateValueAndValidity();

    component.submit();
    tick(1);

    expect(routerSpy).toHaveBeenCalledWith([ 'reset-password' ]);
    expect(authServiceSpy).toHaveBeenCalledWith('good@gmail.com');
    expect(component[ 'errorMessage' ]).toBe(undefined);
  }));


  it('should display error message if the form comes back with an error', fakeAsync(() => {

    errorMessage = 'There was an error.';
    component.form.get('email').setValue('bad@gmail.com');
    component.form.updateValueAndValidity();

    component.submit();
    tick(1);

    expect(routerSpy).not.toHaveBeenCalledWith([ 'reset-password' ]);
    expect(authServiceSpy).toHaveBeenCalledWith('bad@gmail.com');
    expect(component[ 'errorMessage' ]).toBe('There was an error.');
  }));

});
