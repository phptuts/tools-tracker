import { AuthService } from './auth.service';
import { AuthClass, CognitoUser } from '@aws-amplify/auth';
import { Injectable } from '@angular/core';

@Injectable()
export class CognitoService implements AuthService {

    constructor( private awsAuth: AuthClass ) {
    }


    public async signIn( email: string, password ):  Promise<undefined | string> {
        try {
            const user = await this.awsAuth.signIn(email, password) as CognitoUser;
            const jwtToken = user.getSignInUserSession().getAccessToken().getJwtToken();
            const refreshToken = user.getSignInUserSession().getRefreshToken().getToken();
            localStorage.setItem('jwt_token', jwtToken);
            localStorage.setItem('refresh_token', refreshToken);
        } catch (e) {
            console.log(e, 'error message');
            return e.message;
        }
    }

    public async doesEmailExist(email: string): Promise<boolean> {
        try {
            await this.awsAuth.confirmSignUp(email, '000000', {
                forceAliasCreation: false
            });
        } catch (e) {
            return e.code !== 'UserNotFoundException';
        }

        return false;
    }
}
