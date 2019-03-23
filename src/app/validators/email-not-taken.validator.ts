import { FormControl } from '@angular/forms';
import { timer } from 'rxjs';
import { AuthService } from '../providers/auth.service';
import { map, switchMap } from 'rxjs/operators';

export const validateEmailDoesNotExist = (authService: AuthService, time: number = 500) => {
    return (input: FormControl) => {
        return timer(time).pipe(
            switchMap(() => authService.doesEmailExist(input.value)),
            map(doesEmailExist => {
                return doesEmailExist ? {emailExists: true} : null;
            })
         );
    };
};

