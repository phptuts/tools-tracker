import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuComponent } from './menu.component';
import { AuthService } from '../../providers/auth.service';
import { Observable, of } from 'rxjs';
import { User } from '../../model/user';
import { map } from 'rxjs/operators';

describe('MenuComponent', () => {
    let component: MenuComponent;
    let fixture: ComponentFixture<MenuComponent>;
    let user: any = undefined;

    class MockAuthService implements Partial<AuthService> {
        public readonly user$ = of(undefined).pipe(map(() => user));
    }



    beforeEach(async(() => {
        const mockAuthSerivce = new MockAuthService();

        TestBed.configureTestingModule({
            declarations: [ MenuComponent ],
            providers: [
                {
                    useValue: mockAuthSerivce,
                    provide: AuthService
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    

});


