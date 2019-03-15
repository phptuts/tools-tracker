import { Injectable } from '@angular/core';

@Injectable()
export abstract class AuthService {

    public abstract async signIn( email: string, password: string ): Promise<undefined | string>;

}
