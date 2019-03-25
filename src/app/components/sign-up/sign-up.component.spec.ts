import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import { AuthService } from '../../providers/auth.service';
import { Observable, of } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  const authService: Partial<AuthService> = {
    signUp(email: string, password: string): Observable<string | undefined> {
      return of(undefined);
    }
  };

  let errorMessage: undefined|string;

  let authServiceSpy: jasmine.Spy;

  const router: Partial<Router> = {
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
      return Promise.resolve(true);
    }
  };

  let routerSpy: jasmine.Spy;

  beforeEach(async(() => {

    routerSpy = spyOn(router, 'navigate')
        .and.returnValue(of(true));

    authServiceSpy = spyOn(authService, 'signUp')
        .and.callFake(() => of(errorMessage));


    TestBed.configureTestingModule({
      declarations: [ SignUpComponent ],
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
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // A way of disabling the async validator because they make network calls
    component.form.get('email').asyncValidator = () => of(undefined);

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

    expect(routerSpy).toHaveBeenCalledWith([ 'verify-email' ]);
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

    expect(routerSpy).not.toHaveBeenCalledWith([ 'verify-email' ]);
    expect(authServiceSpy).toHaveBeenCalledWith('bad@gmail.com', 'password');
    expect(component[ 'errorMessage' ]).toBe('There was an error.');
  }));

});
