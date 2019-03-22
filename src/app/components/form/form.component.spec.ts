import 'jasmine';
import { FormComponent } from './form.component';
import { FormBuilder, FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { async, fakeAsync, tick } from '@angular/core/testing';

describe(FormComponent.name, () => {
    let formComponent: TestComponent;
    let requestSpy: jasmine.Spy;
    let successSpy: jasmine.Spy;

    beforeEach(() => {
        formComponent = new TestComponent();
        formComponent.form = new FormGroup({
            'email': new FormControl('', [ Validators.required ])
        });
        requestSpy = spyOn(formComponent, 'request');
        successSpy = spyOn(formComponent, 'success');
    });

    it('should default to not allow submitting the form until everything is valid', () => {
        expect(formComponent.canSubmit()).toBeFalsy();

        formComponent.form.get('email').setValue('gl@sadf.com');
        formComponent.form.updateValueAndValidity();
        formComponent[ 'submitting' ] = false;

        expect(formComponent.canSubmit()).toBeTruthy();

        formComponent[ 'submitting' ] = true;
        expect(formComponent.canSubmit()).toBeFalsy();
    });

    it('test form submission', fakeAsync((done) => {

        requestSpy.and.returnValue(new Promise((res, rej) => {
            // Tests that before the request
            // is processed that user can not submit the form
            expect(formComponent.canSubmit()).toBeFalsy();
            res(undefined);
        }));

        successSpy.and.returnValue(null);

        formComponent.form.get('email').setValue('gl@sadf.com');
        formComponent[ 'submitting' ] = false;

        expect(formComponent.canSubmit()).toBeTruthy();

        formComponent.submit();
        tick(1); // resolves the promise

        // Tests the user can submit and the methods have been called
        expect(formComponent.canSubmit()).toBeTruthy();

        expect(requestSpy).toHaveBeenCalled();
        expect(successSpy).toHaveBeenCalled();

    }));

    it('should not be able to handle unexpected error message', fakeAsync(() => {
            requestSpy.and.returnValue(new Promise((res, rej) => {
                // Tests that before the request
                // is processed that user can not submit the form
                expect(formComponent.canSubmit()).toBeFalsy();
                rej(new Error('There was an error.'));
            }));

            successSpy.and.returnValue(null);

            formComponent.form.get('email').setValue('gl@sadf.com');
            formComponent[ 'submitting' ] = false;

            expect(formComponent.canSubmit()).toBeTruthy();

            formComponent.submit();
            tick(1); // resolves the promise

            // Tests the user can submit and the methods have been called
            expect(formComponent.canSubmit()).toBeTruthy();

            expect(requestSpy).toHaveBeenCalled();
            expect(successSpy).not.toHaveBeenCalled();
            expect(formComponent[ 'errorMessage' ]).toBe('There was an error.');
        })
    );

    it('should not be able to handle expected error message', fakeAsync(() => {
        requestSpy.and.returnValue(new Promise((res, rej) => {
            // Tests that before the request
            // is processed that user can not submit the form
            expect(formComponent.canSubmit()).toBeFalsy();
            res('There was an error.');
        }));

        successSpy.and.returnValue(null);

        formComponent.form.get('email').setValue('gl@sadf.com');
        formComponent[ 'submitting' ] = false;

        expect(formComponent.canSubmit()).toBeTruthy();

        formComponent.submit();
        tick(1); // resolves the promise

        // Tests the user can submit and the methods have been called
        expect(formComponent.canSubmit()).toBeTruthy();

        expect(requestSpy).toHaveBeenCalled();
        expect(successSpy).not.toHaveBeenCalled();
        expect(formComponent[ 'errorMessage' ]).toBe('There was an error.');

    }));

    it('should return that error message needs to be displayed on field', () => {
        formComponent.form.get('email').setValue('');
        formComponent.form.get('email').touched = true;
        formComponent.form.updateValueAndValidity();
        expect(formComponent.showError('email')).toBeTruthy();

        formComponent.form.get('email').setValue('asdf@asdf.com');
        formComponent.form.updateValueAndValidity();
        expect(formComponent.showError('email')).toBeFalsy();
    });

    it('should return true if that type of error message is being triggered', () => {
        formComponent.form.get('email').setValue('');
        formComponent.form.updateValueAndValidity();
        expect(formComponent.hasErrorType('email', 'required')).toBeTruthy();
        expect(formComponent.hasErrorType('email', 'minLength')).toBeFalsy();
    });

});

class TestComponent extends FormComponent {

    public form: any | FormGroup;

    constructor() {
        super();
        this.form = new FormGroup({
            'email': new FormControl('', [ Validators.required ])
        });
    }


    public async request(): Promise<string | undefined> {
        return;
    }

    public success(): void {
    }
}
