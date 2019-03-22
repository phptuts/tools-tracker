import 'jasmine';
import { AuthService } from '../providers/auth.service';
import { validateEmailDoesNotExist } from './email-not-taken.validator';
import { FormControl } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';

describe('Email Not Taken Validator', () => {

    const service: any | Partial<AuthService> = {};

    let foundEmail = true;

    service.doesEmailExist = (email: string): Promise<boolean> => {
        return Promise.resolve(foundEmail);
    };

    const formInput: Partial<FormControl> | any = {
        value: 'email@gmail.com'
    };

    let doesEmailExistSpy: jasmine.Spy;

    beforeEach(() => {
        doesEmailExistSpy = spyOn(service, 'doesEmailExist').and.callThrough();
    });

    it('should return null if email does not exist in the system.', fakeAsync(() => {
        foundEmail = false;

        validateEmailDoesNotExist(service, 500)(formInput)
            .subscribe(error => {
                expect(error).toBeNull();
            });

        tick(600);
        expect(doesEmailExistSpy).toHaveBeenCalledWith('email@gmail.com');

    }));

    it('should return email error if email does exist in the system.', fakeAsync(() => {
        foundEmail = true;

        validateEmailDoesNotExist(service, 500)(formInput)
            .subscribe(error => {
                expect(error).toEqual( {emailExists: true});
            });

        tick(600);
        expect(doesEmailExistSpy).toHaveBeenCalledWith('email@gmail.com');

    }));

});
