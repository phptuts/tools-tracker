import { Component, OnInit } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { Observable } from 'rxjs';
import { AuthService } from '../../providers/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: [ './reset-password.component.scss' ]
})
export class ResetPasswordComponent extends FormComponent {

    public form = this.formBuilder.group({
        'code': [
            '',
            Validators.compose([ Validators.required ])
        ],
        'password': [
            '',
            Validators.compose(
                [ Validators.required, Validators.minLength(5) ]
            )
        ]
    });


    constructor(
        private authService: AuthService,
        private router: Router,
        private formBuilder: FormBuilder
    ) {
        super();
    }

    protected request(): Observable<string | undefined> {
        return this.authService.resetPassword(
            this.form.get('code').value,
            this.form.get('password').value
        );
    }

    protected success(): void {
        this.router.navigate(['login']);
    }


}
