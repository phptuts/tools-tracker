import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../providers/auth.service';
import { FormComponent } from '../form/form.component';
import { Observable } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent extends FormComponent {

  public form = this.formBuilder.group({
    'email': [
      '',
      Validators.compose([ Validators.required, Validators.email ])
    ]
  });

  constructor(
      private router: Router,
      private formBuilder: FormBuilder,
      private authService: AuthService) {
     super();
  }

  protected request(): Observable<string | undefined> {
    return this.authService.forgetPassword(this.form.get('email').value);
  }

  protected success(): void {
     this.router.navigate(['reset-password']);
  }


}
