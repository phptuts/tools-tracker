import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable()
export abstract class AuthService {

    public abstract readonly user$: Observable<User|undefined>;

    public abstract signUp (email: string, password: string): Observable<undefined | string>;

    public abstract confirmEmailAddress(passCode: string): Observable<undefined | string>;

    public abstract signIn( email: string, password: string ): Observable<undefined | string>;

    public abstract doesEmailExist(email: string): Observable<boolean>;

    public abstract forgetPassword(email: string): Observable<undefined | string>;

    public abstract resetPassword(email: string, code: string, newPassword: string): Observable<undefined|string>;

    public abstract logout(): Observable<undefined>;

}
