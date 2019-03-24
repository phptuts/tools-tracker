import 'jasmine';
import { AuthClass } from '@aws-amplify/auth';
import { ConfirmSignUpOptions, SignInOpts, SignUpParams } from '@aws-amplify/auth/lib/types';
import { CognitoService } from './cognito.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('Cognito Service', () => {

    let confirmSignUpErrorCode = '';

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


    const awsService: Partial<AuthClass> | any = {
        signIn(usernameOrSignInOpts: string | SignInOpts, pw?: string): Promise<any> {
            if (usernameOrSignInOpts === 'email+bad@gmail.com') {
                return Promise.reject({
                    message: 'Error Message'
                });
            }
            return Promise.resolve(awsUser);
        },

        currentAuthenticatedUser() {
           return Promise.resolve({
               getUsername() {
                   return 'auth_user@gmail.com';
               }
           });
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
        }
    };

    let spyConfirmSignUp: jasmine.Spy;
    let spySignIn: jasmine.Spy;
    let spySignUp: jasmine.Spy;
    let cognitoService: CognitoService;

    beforeEach(() => {
        spyConfirmSignUp = spyOn(awsService, 'confirmSignUp').and.callThrough();
        spySignIn = spyOn(awsService, 'signIn').and.callThrough();
        spySignUp = spyOn(awsService, 'signUp').and.callThrough();
        cognitoService = new CognitoService(awsService);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
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
        it ('should return an error message in subscribe', fakeAsync(() => {
            cognitoService
                .confirmEmailAddress('error code')
                .subscribe(err => expect(err).toBe('Error Message'));

            tick(1);
            expect(spyConfirmSignUp)
                .toHaveBeenCalledWith('auth_user@gmail.com', 'error code');
        }));

        it ('should return undefined if successful', fakeAsync(() => {
            cognitoService
                .confirmEmailAddress('success')
                .subscribe(err => expect(err).toBeUndefined());
            tick(1);
            expect(spyConfirmSignUp)
                .toHaveBeenCalledWith('auth_user@gmail.com', 'success');
        }));
    });

});
