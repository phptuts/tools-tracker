import { FormControl, ValidationErrors } from '@angular/forms';
import { from, timer } from 'rxjs';
import { AuthService } from '../providers/auth.service';
import { map, switchMap } from 'rxjs/operators';

export const validateEmailDoesNotExist = (authService: AuthService, time: number = 500) => {
    return (input: FormControl) => {
        return timer(time).pipe(
            switchMap(() => from(authService.doesEmailExist(input.value))),
            map(doesEmailExist => {
                return doesEmailExist ? {emailExists: true} : null;
            })
         );
    };
};

export const validateEmailDoesNotExistPromise = (authService: AuthService): ValidationErrors => {
    return async (input: FormControl) => {
        console.log(input.value, 'promise being called');
        const doesEmailExist = await authService.doesEmailExist(input.value);

        return doesEmailExist ? {emailExists: true} : undefined;
    };
};

