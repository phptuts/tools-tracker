import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { AuthClass } from '@aws-amplify/auth';
import { AppConfig } from '../environments/environment';
import { AuthService } from './providers/auth.service';
import { CognitoService } from './providers/cognito.service';
import { LoginComponent } from './components/login/login.component';

// AoT requires an exported function for factories



@NgModule( {
    declarations: [
        AppComponent,
        HomeComponent,
        WebviewDirective,
        LoginComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule
    ],
    providers: [
        ElectronService,
        {
            provide: AuthClass,
            useFactory: () => {
                return new AuthClass( {
                    userPoolId: AppConfig.userPoolId,
                    userPoolWebClientId: AppConfig.userPoolWebClientId
                });
            },
            useExisting: true
        },
        {
            provide: AuthService,
            useClass: CognitoService,
            deps: [AuthClass]
        }
    ],
    bootstrap: [ AppComponent ]
} )
export class AppModule {
}
