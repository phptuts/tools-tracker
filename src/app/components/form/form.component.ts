import { FormGroup } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { catchError, delay, take, takeUntil, tap } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

export abstract class FormComponent implements OnDestroy {

    private unsub: Subject<any> = new Subject();

    protected form: FormGroup;

    protected submitting = false;

    protected errorMessage: string;

    /**
     * Returns true if the form can be submitted
     */
    public canSubmit(): boolean {
        return this.form.valid && !this.submitting;
    }

    /**
     * Returns true if there is an error on the field.
     */
    public showError(fieldName: string): boolean {
        return !this.form.get(fieldName).valid && this.form.get(fieldName).touched
            && !this.form.get(fieldName).pending;
    }

    /**
     * Returns true if the error type needs to be displayed.
     */
    public hasErrorType(fieldName: string, type: string): boolean {
        return this.form.get(fieldName).hasError(type);
    }

    /**
     * submits the form request to the server
     */
    public submit() {
        if (!this.canSubmit()) {
            return;
        }

        this.submitting = true;

        this.request()
            .pipe(
                takeUntil(this.unsub),
                catchError(err =>  of(err.message)),
                take(1),
                tap(err => {
                    this.submitting = false;

                    if (err) {
                        this.errorMessage = err;
                        return;
                    }

                    this.success();
                }),
            ).subscribe();
    }

    /**
     * The function that makes the request to the server
     */
    protected abstract request(): Observable<undefined | string>;

    /**
     * The function that runs if everything was successful
     */
    protected abstract success(): void;

    ngOnDestroy(): void {
        this.unsub.next();
        this.unsub.complete();
    }


}
