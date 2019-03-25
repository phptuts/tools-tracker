import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { VerifyEmailComponent } from './verify-email.component';
import { AuthService } from '../../providers/auth.service';
import { Observable, of } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;

  let errorMessage: undefined|string;

  const authService: Partial<AuthService> = {
    confirmEmailAddress(passcode: string): Observable<string | undefined> {
      return of(undefined);
    }
  };

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

    authServiceSpy = spyOn(authService, 'confirmEmailAddress')
        .and.callFake(() => of(errorMessage));


    TestBed.configureTestingModule({
      declarations: [ VerifyEmailComponent ],
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
    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit be able to submit and navigate to the next page', fakeAsync(() => {

    errorMessage = undefined;
    component.form.get('code').setValue('code323');
    component.form.updateValueAndValidity();

    component.submit();
    tick(1);

    expect(routerSpy).toHaveBeenCalledWith([ 'login' ]);
    expect(authServiceSpy).toHaveBeenCalledWith('code323');
    expect(component[ 'errorMessage' ]).toBe(undefined);
  }));


  it('should display error message if the form comes back with an error', fakeAsync(() => {

    errorMessage = 'There was an error.';
    component.form.get('code').setValue('code323');
    component.form.updateValueAndValidity();

    component.submit();
    tick(1);

    expect(routerSpy).not.toHaveBeenCalledWith([ 'login' ]);
    expect(authServiceSpy).toHaveBeenCalledWith('code323');
    expect(component[ 'errorMessage' ]).toBe('There was an error.');
  }));
});
