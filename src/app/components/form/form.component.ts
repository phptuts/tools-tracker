import { FormGroup } from '@angular/forms';

export abstract class FormComponent {

    protected form: FormGroup;

    protected submitting = false;

    protected errorMessage = '';

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
    public async submit() {
        if (!this.canSubmit()) {
            return;
        }

        this.submitting = true;

        try {
            this.errorMessage = await this.request();
        } catch (e) {
            this.errorMessage = e.message;
        }

        this.submitting = false;

        if (!this.errorMessage) {
            this.success();
            return;
        }
    }

    /**
     * The function that makes the request to the server
     */
    protected abstract async request(): Promise<undefined | string>;

    /**
     * The function that runs if everything was successful
     */
    protected abstract success(): void;
}
