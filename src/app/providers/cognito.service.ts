import { AuthService } from './auth.service';
import { AuthClass } from '@aws-amplify/auth';
import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class CognitoService implements AuthService {

    constructor(private awsAuth: AuthClass) { }

    /**
     * Returns undefined if successful and an error if something failed, in the observable.
     */
    public signIn(email: string, password): Observable<undefined | string> {
        return from(this.awsAuth.signIn(email, password))
            .pipe(
                tap(user => {

                    const jwtToken = user
                        .getSignInUserSession()
                        .getAccessToken()
                        .getJwtToken();

                    const refreshToken = user
                        .getSignInUserSession()
                        .getRefreshToken()
                        .getToken();

                    localStorage.setItem('jwt_token', jwtToken);
                    localStorage.setItem('refresh_token', refreshToken);
                }),
                map(() => undefined),
                catchError(err => of(err.message))
            );

    }

    /**
     * Returns a false observable if email does not exist.
     */
    public doesEmailExist(email: string): Observable<boolean> {
        return from(this.awsAuth.confirmSignUp(email, '000000', {
            forceAliasCreation: false
        })).pipe(
            map(() => false),
            catchError(err => of(err.code !== 'UserNotFoundException'))
        );
    }
}
