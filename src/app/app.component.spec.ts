import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ElectronService } from './providers/electron.service';
import { MenuComponent } from './components/menu/menu.component';
import { AuthService } from './providers/auth.service';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

describe('AppComponent', () => {
  let user: any = undefined;

  class MockAuthService implements Partial<AuthService> {
    public readonly user$ = of(undefined).pipe(map(() => user));
  }

  beforeEach(async(() => {

    const mockAuthService = new MockAuthService();
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MenuComponent
      ],
      providers: [
        ElectronService,
        {
          useValue: mockAuthService,
          provide: AuthService
        }
      ],
      imports: [
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});

class TranslateServiceStub {
  setDefaultLang(lang: string): void {
  }
}
