import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../providers/auth.service';

@Component( {
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [ './home.component.scss' ]
} )
export class HomeComponent implements OnInit {

    constructor( private  authService: AuthService ) {

    }

    ngOnInit() {
        this.blah();
    }

    async blah() {
        const result = await this.authService.signIn(
            'glaserpower+tools2@gmail.com',
            'moomoo'
        );
        console.log( result, 'moo' );
    }

}
