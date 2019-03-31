import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../providers/auth.service';
import { Observable, of } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  const authService: Partial<AuthService> = {
    resetPassword(code: string, password: string): Observable<string | undefined> {
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

    authServiceSpy = spyOn(authService, 'resetPassword')
        .and.callFake(() => of(errorMessage));

    TestBed.configureTestingModule({
      declarations: [ ResetPasswordComponent ],
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
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit be able to submit and navigate to the next page', fakeAsync(() => {

    errorMessage = undefined;
    component.form.get('password').setValue('fake_password');
    component.form.get('code').setValue('code23');
    component.form.updateValueAndValidity();

    component.submit();
    tick(1);

    expect(routerSpy).toHaveBeenCalledWith([ 'login' ]);
    expect(authServiceSpy).toHaveBeenCalledWith('code23', 'fake_password');
    expect(component[ 'errorMessage' ]).toBe(undefined);
  }));


  it('should display error message if the form comes back with an error', fakeAsync(() => {

    errorMessage = 'There was an error.';
    component.form.get('password').setValue('fake_password');
    component.form.get('code').setValue('code23');
    component.form.updateValueAndValidity();

    component.submit();
    tick(1);

    expect(routerSpy).not.toHaveBeenCalledWith([ 'login' ]);
    expect(authServiceSpy).toHaveBeenCalledWith('code23', 'fake_password');
    expect(component[ 'errorMessage' ]).toBe('There was an error.');
  }));
});
