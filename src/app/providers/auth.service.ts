import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export abstract class AuthService {

    public abstract signUp (email: string, password: string): Observable<undefined | string>;

    public abstract confirmEmailAddress(passCode: string): Observable<undefined | string>;

    public abstract signIn( email: string, password: string ): Observable<undefined | string>;

    public abstract doesEmailExist(email: string): Observable<boolean>;
}
