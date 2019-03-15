import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { AuthClass } from '@aws-amplify/auth';
import { AppConfig } from '../environments/environment';
import { AuthService } from './providers/auth.service';
import { CognitoService } from './providers/cognito.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory( http: HttpClient ) {
    return new TranslateHttpLoader( http, './assets/i18n/', '.json' );
}

@NgModule( {
    declarations: [
        AppComponent,
        HomeComponent,
        WebviewDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        TranslateModule.forRoot( {
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [ HttpClient ]
            }
        } )
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
