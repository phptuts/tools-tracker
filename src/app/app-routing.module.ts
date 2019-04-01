import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { AuthGuard } from './guard/auth.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { NotLoggedInGuard } from './guard/not-logged-in.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [ NotLoggedInGuard ]
    },
    {
        path: 'sign-up',
        component: SignUpComponent,
        canActivate: [ NotLoggedInGuard ]
    },
    {
        path: 'verify-email',
        component: VerifyEmailComponent,
        canActivate: [ NotLoggedInGuard ]
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        canActivate: [ NotLoggedInGuard ]
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [ NotLoggedInGuard ]
    },
    {
        path: '',
        component: HomeComponent,
        canActivate: [ AuthGuard ]
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {
}
