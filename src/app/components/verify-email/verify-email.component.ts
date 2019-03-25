import { Component } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../providers/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent extends FormComponent{

  public form = this.formBuilder.group({
    'code': [
      '',
      Validators.compose(
          [ Validators.required, Validators.minLength(6) ]
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
    return this.authService.confirmEmailAddress(this.form.get('code').value);
  }

  protected success(): void {
    this.router.navigate(['login']);
  }


}
