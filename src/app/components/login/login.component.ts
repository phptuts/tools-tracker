import { Component } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../providers/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.scss' ]
})
export class LoginComponent extends FormComponent {

    public form = this.formBuilder.group({
        'email': [
            '',
            Validators.compose([ Validators.required, Validators.email ])
        ],
        'password': [
            '',
            Validators.compose(
                [ Validators.required, Validators.minLength(5) ]
            )
        ]
    });

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        super();
    }

    public request(): Observable<string | undefined> {
        return this.authService.signIn(
            this.form.get('email').value,
            this.form.get('password').value
        );
    }

    public success(): void {
        this.router.navigate(['']);
    }
}
