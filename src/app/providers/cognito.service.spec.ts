import 'jasmine';
import { AuthClass, CognitoUser } from '@aws-amplify/auth';
import { ConfirmSignUpOptions, SignInOpts, SignUpParams } from '@aws-amplify/auth/lib/types';
import { CognitoService } from './cognito.service';
import { fakeAsync, tick } from '@angular/core/testing';
import { instance, mock, when } from 'ts-mockito';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

describe('Cognito Service', () => {

    let confirmSignUpErrorCode = '';

    const cognitoUserMocked = mock(CognitoUser);
    when(cognitoUserMocked.getUsername()).thenReturn('user_id');

    const awsUser = {
        getSignInUserSession() {
            return {
                getAccessToken() {
                    return {
                        getJwtToken() {
                            return 'asdf_jwt_token';
                        }
                    };
                },
                getRefreshToken() {
                    return {
                        getToken() {
                            return 'asdf_refresh_token';
                        }
                    };
                }
            };
        },
    };


    const awsService: AuthClass | any = {
        signIn(usernameOrSignInOpts: string | SignInOpts, pw?: string): Promise<any> {
            if (usernameOrSignInOpts === 'email+bad@gmail.com') {
                return Promise.reject({
                    message: 'Error Message'
                });
            }
            return Promise.resolve(awsUser);
        },

        userAttributes(user: CognitoUser) {
            const attributes = [];
            attributes
                .push(new CognitoUserAttribute({Name: 'email', Value: 'user@gmail.com'}));
            attributes
                .push(new CognitoUserAttribute({Name: 'sub', Value: 'user_id'}));

            return Promise.resolve(attributes);
        },

        currentAuthenticatedUser() {
            const user: CognitoUser = instance(cognitoUserMocked);

            return Promise.resolve(user);
        },

        confirmSignUp(username: string, code: string, options?: ConfirmSignUpOptions): Promise<any> {

            if (username === 'email+reject@gmail.com' || code === 'error code') {
                return Promise.reject({
                    message: 'Error Message',
                    code: confirmSignUpErrorCode
                });
            }
            return Promise.resolve(awsUser);
        },

        signUp(params: SignUpParams, ...restOfAttrs): Promise<any> {
            if (params.username === 'bad@gmail.com') {
                return Promise.reject({
                    message: 'Error Message'
                });
            }

            return Promise.resolve({});
        },

        forgotPassword(username: string): any {
            if (username === 'bad@gmail.com') {
                return Promise.reject({
                    message: 'Error Message'
                });
            }

            return Promise.resolve(null);
        },

        forgotPasswordSubmit(username: string, code: string, password: string): any {
            if (username === 'bad@gmail.com') {
                return Promise.reject({
                    message: 'Error Message'
                });
            }

            return Promise.resolve(null);
        },

    };

    let spyConfirmSignUp: jasmine.Spy;
    let spySignIn: jasmine.Spy;
    let spySignUp: jasmine.Spy;
    let spyForgetPassword: jasmine.Spy;
    let spyForgotPasswordSubmit: jasmine.Spy;
    let cognitoService: CognitoService;

    beforeEach(() => {
        spyConfirmSignUp = spyOn(awsService, 'confirmSignUp').and.callThrough();
        spySignIn = spyOn(awsService, 'signIn').and.callThrough();
        spySignUp = spyOn(awsService, 'signUp').and.callThrough();
        spyForgetPassword = spyOn(awsService, 'forgotPassword').and.callThrough();
        spyForgotPasswordSubmit = spyOn(awsService, 'forgotPasswordSubmit').and.callThrough();
        cognitoService = new CognitoService(awsService);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('email_signup');

    });

    describe('signIn', () => {
        it('should map to undefined if successful and store auth tokens', fakeAsync(() => {
            cognitoService.signIn('email@gmail.com', 'moomoo').subscribe(message => {
                expect(message).toBeUndefined();
            });
            tick(1);
            expect(spySignIn).toHaveBeenCalledWith('email@gmail.com', 'moomoo');
            expect(localStorage.getItem('jwt_token')).toBe('asdf_jwt_token');
            expect(localStorage.getItem('refresh_token')).toBe('asdf_refresh_token');
        }));

        it('should return an error message on signin if failed', fakeAsync(() => {
            cognitoService.signIn('email+bad@gmail.com', 'moomoo').subscribe(message => {
                expect(message).toBe('Error Message');
            });
            tick(1);
            expect(spySignIn).toHaveBeenCalledWith('email+bad@gmail.com', 'moomoo');
            expect(localStorage.getItem('jwt_token')).toBeFalsy();
            expect(localStorage.getItem('refresh_token')).toBeFalsy();
        }));
    });


    describe('doesEmailExist', () => {
        it('should return true if it gets a non UserNotFoundException', fakeAsync(() => {
            confirmSignUpErrorCode = 'AuthCodeFailed';
            cognitoService.doesEmailExist('email+reject@gmail.com').subscribe(doesEmailExist => {
                expect(doesEmailExist).toBeTruthy();
            });
            tick(1);
            expect(spyConfirmSignUp).toHaveBeenCalledWith('email+reject@gmail.com', '000000', {
                forceAliasCreation: false
            });
        }));

        it('should return true if it gets a UserNotFoundException', fakeAsync(() => {
            confirmSignUpErrorCode = 'UserNotFoundException';
            cognitoService.doesEmailExist('email+reject@gmail.com').subscribe(doesEmailExist => {
                expect(doesEmailExist).toBeFalsy();
            });
            tick(1);
            expect(spyConfirmSignUp).toHaveBeenCalledWith('email+reject@gmail.com', '000000', {
                forceAliasCreation: false
            });
        }));

    });


    describe('Sign Up', () => {
        it('error message should be returned in the subscribe.', fakeAsync(() => {
            cognitoService
                .signUp('bad@gmail.com', 'password')
                .subscribe(err => expect(err).toBe('Error Message'));
            tick(1);
            expect(spySignUp).toHaveBeenCalledWith(
                { username: 'bad@gmail.com', password: 'password' }
            );
        }));

        it('undefined should be return for successful signup', fakeAsync(() => {
            cognitoService
                .signUp('good@gmail.com', 'password')
                .subscribe(err => expect(err).toBeUndefined());
            tick(1);
            expect(spySignUp).toHaveBeenCalledWith(
                { username: 'good@gmail.com', password: 'password' }
            );
        }));

    });

    describe('confirmEmailAddress', () => {
        it('should return an error message in subscribe', fakeAsync(() => {
            localStorage.setItem('email_address', 'auth_user@gmail.com');

            cognitoService
                .confirmEmailAddress('error code')
                .subscribe(err => expect(err).toBe('Error Message'));

            tick(1);
            expect(spyConfirmSignUp)
                .toHaveBeenCalledWith('auth_user@gmail.com', 'error code');
        }));

        it('should return an error message in subscribe if not email address is set in localstorage', fakeAsync(() => {
            localStorage.removeItem('email_address');

            cognitoService
                .confirmEmailAddress('error code')
                .subscribe(err => expect(err).toBe('Invalid email or code, please try again.'));

            tick(1);
            expect(spyConfirmSignUp)
                .not.toHaveBeenCalled();
        }));


        it('should return undefined if successful', fakeAsync(() => {
            localStorage.setItem('email_address', 'auth_user@gmail.com');

            cognitoService
                .confirmEmailAddress('success')
                .subscribe(err => expect(err).toBeUndefined());
            tick(1);
            expect(spyConfirmSignUp)
                .toHaveBeenCalledWith('auth_user@gmail.com', 'success');
        }));
    });

    describe('forgetPassword', () => {
        it('should return an error', fakeAsync(() => {
            cognitoService
                .forgetPassword('bad@gmail.com')
                .subscribe(err => expect(err).toBe('Error Message'));
            tick(1);
            expect(spyForgetPassword)
                .toHaveBeenCalledWith('bad@gmail.com');
        }));

        it('should return an undefined on success', fakeAsync(() => {
            cognitoService
                .forgetPassword('good@gmail.com')
                .subscribe(err => expect(err).toBeUndefined());
            tick(1);
            expect(spyForgetPassword)
                .toHaveBeenCalledWith('good@gmail.com');
        }));
    });

    describe('resetPassword', () => {
        it('should return an error', fakeAsync(() => {
            localStorage.setItem('email_address', 'bad@gmail.com');
            cognitoService
                .resetPassword( 'code', 'newpassword')
                .subscribe(err => expect(err).toBe('Error Message'));
            tick(1);
            expect(spyForgotPasswordSubmit)
                .toHaveBeenCalledWith('bad@gmail.com', 'code', 'newpassword');
        }));

        it('should return an error message if email is not set in local storage', fakeAsync(() => {
            localStorage.removeItem('email_address');
            cognitoService
                .resetPassword( 'code', 'newpassword')
                .subscribe(err => expect(err).toBe('Invalid email or code, please try again.'));
            tick(1);
            expect(spyForgotPasswordSubmit)
                .not.toHaveBeenCalled();

        }));

        it('should return an undefined on success', fakeAsync(() => {
            localStorage.setItem('email_address', 'good@gmail.com');

            cognitoService
                .resetPassword( 'code', 'newpassword')
                .subscribe(err => expect(err).toBeUndefined());
            tick(1);
            expect(spyForgotPasswordSubmit)
                .toHaveBeenCalledWith('good@gmail.com', 'code', 'newpassword');
        }));
    });

    describe('logout', () => {
        it('should remove jwt token call the next function for user subject', fakeAsync(() => {

            localStorage.setItem('jwt_token', 'token');
            localStorage.setItem('refresh_token', 'token');
            const spyUserSubjectNext = spyOn(cognitoService[ 'checkUserSubject' ], 'next')
                .and.returnValue(undefined);

            cognitoService
                .logout()
                .subscribe(message => expect(message).toBeUndefined());

            tick(1);

            expect(spyUserSubjectNext).toHaveBeenCalled();
            expect(localStorage.getItem('jwt_token')).toBeNull();
            expect(localStorage.getItem('refresh_token')).toBeNull();
        }));


    });

    describe('user$', () => {
        it('should return the latest cognito user', fakeAsync(() => {
            let counter = 0;
            const sub = cognitoService.user$.subscribe(user => {
                console.log(user, 'actual user being returned');
                counter += 1;
                expect(user.email).toBe('user@gmail.com');
                expect(user.id).toBe('user_id');
            });

            cognitoService[ 'checkUserSubject' ].next(undefined);
            tick(1);
            cognitoService[ 'checkUserSubject' ].next(undefined);
            tick(1);

            // Testing change until distinct is applied
            expect(counter).toBe(1);
            sub.unsubscribe(); // This is because of the interval.
            // This observable will keep on emitting data until it stops.
        }));
    });

});
