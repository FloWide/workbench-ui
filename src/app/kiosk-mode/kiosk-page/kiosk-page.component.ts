import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@core/services';
import { AppState, Select } from '@core/store';
import { ScriptActions } from '@core/store/script/script.action';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { KeycloakError, KeycloakProfile } from 'keycloak-js';
import { interval, of, Subject, timer } from 'rxjs';
import { catchError, delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ScriptRunnerComponent } from 'src/app/script-runner/script-runner/script-runner.component';



@Component({
  selector: 'app-kiosk-page',
  templateUrl: './kiosk-page.component.html',
  styleUrls: ['./kiosk-page.component.scss']
})
export class KioskPageComponent implements OnInit,OnDestroy {

  private destroy$ = new Subject();

  loggedIn: boolean = false;

  loginError: KeycloakError = null;

  @ViewChild('scriptRunner') scriptRunner: ScriptRunnerComponent;

  private startTokenRefresh$ = new Subject();

  private expiresIn: number = null;

  constructor(
    private auth: AuthenticationService,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private actions$: Actions
  ) { }
  
  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap((params) => {
        const username = params["username"];
        const password = params["password"];
        return this.auth.directGrantLogin(username,password).pipe(
          catchError((err: HttpErrorResponse) => {
            this.loginError = err.error;
            return of(false);
          })
        );
      }),
      tap((loginData) => {
        this.loggedIn = !!loginData;
        if (this.loggedIn) {
          this.store.dispatch(ScriptActions.GetScripts());
        }
        console.log('orthis');
      }),
      takeUntil(this.destroy$)
    ).subscribe(this.onLoginSuccess.bind(this));
    
    this.startTokenRefresh$.pipe(
      filter(() => this.expiresIn !== null && this.expiresIn !== undefined),
      switchMap(() => timer(this.expiresIn*1000)),
      switchMap(() => {
        return this.route.queryParams.pipe(
          switchMap((params) => {
            const username = params["username"];
            const password = params["password"];
            return this.auth.directGrantLogin(username,password).pipe(
              catchError((err: HttpErrorResponse) => {
              this.loginError = err.error;
              return of(false);
            })
          );  
          })
        )
      }),
      tap((data) =>{
        this.loggedIn = !!data;
        console.log('this');
      }),
      takeUntil(this.destroy$)
    ).subscribe(this.onLoginSuccess.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onLoginSuccess([token,userdata,expires]: [string,KeycloakProfile,number]) {
    this.expiresIn = expires;
    this.startTokenRefresh$.next();
    this.scriptRunner?.refreshUrl();
  }

}
