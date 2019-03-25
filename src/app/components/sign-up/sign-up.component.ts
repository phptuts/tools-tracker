import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../providers/auth.service';
import { Router } from '@angular/router';
import { FormComponent } from '../form/form.component';
import { Observable } from 'rxjs';
import { validateEmailDoesNotExist } from '../../validators/email-not-taken.validator';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent extends FormComponent{

  public form = this.formBuilder.group({
    'email': [
      '',
      Validators.compose([ Validators.required, Validators.email ]),
      validateEmailDoesNotExist(this.authService, 500)
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

  protected request(): Observable<string | undefined> {
    return this.authService.signUp(
        this.form.get('email').value,
        this.form.get('password').value
    );
  }

  protected success(): void {
    this.router.navigate([ 'verify-email' ]);
  }



}
