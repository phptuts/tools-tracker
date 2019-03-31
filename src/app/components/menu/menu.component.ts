import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../providers/auth.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public readonly showLoginMenu$ = this.authService.user$
      .pipe(
          map(user => user === undefined),
          catchError(() => of(false))
      );

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

}
