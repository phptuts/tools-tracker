import { AuthService } from './auth.service';
import { AuthClass, CognitoUser } from '@aws-amplify/auth';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { Injectable } from '@angular/core';
import { forkJoin, from, interval, merge, Observable, of, Subject } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    map,
    switchMap,
    tap,
} from 'rxjs/operators';
import { User } from '../model/user';
import * as deepEqual from 'deep-equal';


@Injectable()
export class CognitoService implements AuthService {

    private readonly checkUserSubject = new Subject();

    public readonly user$: Observable<User> = merge<User | undefined>(
        this.checkUserSubject.asObservable(),
        interval(60 * 60 * 2 * 1000)
    ).pipe(
        // currentAuthenticatedUser automatically handles the refresh stuff so we don't have to worry about it.
        switchMap(() => from(this.awsAuth.currentAuthenticatedUser())),
        switchMap((user: CognitoUser) =>
            forkJoin(from(this.awsAuth.userAttributes(user)), of(user))
        ),
        map((returnValue: [ CognitoUserAttribute[], CognitoUser ]) => {
            const attributes = returnValue[ 0 ]
                .map((attribute: CognitoUserAttribute) => {
                    return {
                        name: attribute.getValue(),
                        value: attribute.getName()
                    };
                });

            return {
                attributes,
                email: returnValue[1].getUsername(),
                username: returnValue[1].getUsername()
            };
        }),
        catchError(() => of(undefined)),
        distinctUntilChanged((userA: User | undefined, userB: User | undefined) => {
           return deepEqual(userB, userA);
        })

    );

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

    /**
     * Signs up a new user
     */
    public signUp(email: string, password: string): Observable<string | undefined> {
        return from(this.awsAuth.signUp({ username: email, password }))
            .pipe(
                map(() => undefined),
                tap(() => localStorage.setItem('email_address', email)),
                catchError(err => of(err.message))
            );
    }

    /**
     * Confirms the user's email address
     */
    public confirmEmailAddress(passCode: string): Observable<string | undefined> {
        return from(this.awsAuth.confirmSignUp(localStorage.getItem('email_address'), passCode))
            .pipe(
                tap(() => localStorage.removeItem('email_address')),
                map(() => undefined),
                catchError(err => of(err.message))
            );
    }

    /**
     * Forgetting the password
     */
    public forgetPassword(email: string): Observable<undefined | string> {
        return from(this.awsAuth.forgotPassword(email))
            .pipe(
                map(() => undefined),
                tap(() => localStorage.setItem('email_address', email)),
                catchError(err => of(err.message))
            );
    }

    /**
     * Reset the password
     */
    public resetPassword(code: string, newPassword: string): Observable<string | undefined> {

        const email = localStorage.getItem('email_address');

        if (email) {
            return of('Invalid email or code, please try again.');
        }

        return from(this.awsAuth.forgotPasswordSubmit(email, code, newPassword))
            .pipe(
                map(() => undefined),
                catchError(err => of(err.message))
            );
    }

    /**
     * Logs the user out and notifies the user observable
     */
    public logout(): Observable<undefined> {
        return from(this.awsAuth.currentAuthenticatedUser())
            .pipe(
                // using any because the api uses it :( but we map it later on.
                switchMap((user: CognitoUser) => from<any>(user.signOut())),
                map(() => undefined),
                catchError(() => of(undefined)),
                // This we want to happen no what.
                tap(() => this.checkUserSubject.next(undefined)),
                tap(() => {
                    // cleaning out the auth tokens
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('refresh_token');
                }),
            );
    }
}
