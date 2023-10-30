import { Breakpoints } from '@angular/cdk/layout';
import { BreakpointObserver } from '@angular/cdk/layout';
import { KeyValue } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '@components/dialogs/confirm-dialog/confirm-dialog.component';
import { ScriptActions as ScriptButtonActions } from '@components/streamlit-script-button/streamlit-script-button.component';
import { ScriptModel, Scripts, UserProfile } from '@core/services';
import { RepositoryForkModel } from '@core/services/repo/repo.model';
import { Users } from '@core/services/user/user.model';
import { AppState, Select, UserActions } from '@core/store';
import { RepositoryActions } from '@core/store/repo/repo.action';
import { ScriptActions } from '@core/store/script/script.action';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { take } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ForkDialogComponent, ForkDialogData } from '../fork-dialog/fork-dialog.component';
import { ScriptServiceDetailsComponent } from '../script-service-details/script-service-details.component';
import { UpdateDialogComponent } from '../update-dialog/update-dialog.component';

@Component({
  selector: 'app-script-board',
  templateUrl: './script-board.component.html',
  styleUrls: ['./script-board.component.scss']
})
export class ScriptBoardComponent implements OnInit,OnDestroy {

  private destroy$ = new Subject();

  @Input() filter: string = '';

  scripts: Scripts = {};

  user: UserProfile = null;

  cols = 4

  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router,
    private breakpoint:BreakpointObserver,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }
  

  ngOnInit(): void {
    this.store.dispatch(ScriptActions.GetScripts());
    this.store.dispatch(UserActions.GetMe());
    this.breakpoint.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if(result.matches) {
        if (result.breakpoints[Breakpoints.Small] || result.breakpoints[Breakpoints.XSmall]) {
          this.cols = 1;
        }
        else if (result.breakpoints[Breakpoints.Medium]) {
          this.cols = 2;
        }
        else if (result.breakpoints[Breakpoints.Large] || result.breakpoints[Breakpoints.XLarge] ) {
          this.cols = 4;
        }
        this.cd.detectChanges();
      }
    });

    this.store.select(Select.scripts).pipe(
      takeUntil(this.destroy$)
    ).subscribe((scripts) => {
      this.scripts = scripts;
    });

    this.store.select(Select.user).pipe(
      takeUntil(this.destroy$)
    ).subscribe((user) => {
      this.user = user;
    });

    this.actions$.pipe(
      ofType(RepositoryActions.DeleteRepositorySuccess),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      this.store.dispatch(ScriptActions.GetScripts());
    });

  }


  async onScriptAction([script,action]: [ScriptModel,ScriptButtonActions]) {
    switch (action) {
      case ScriptButtonActions.RUN_IN_FULLSCREEN:
        this.router.navigate(['script',script.compound_id[0],script.compound_id[1]],{
          queryParams:{
            h:false
          }
        })
        break;
      case ScriptButtonActions.DETAILS:
        this.dialog.open(ScriptServiceDetailsComponent,{
          data:script
        });
        break;
    }
  }

  onScriptClicked(script: ScriptModel) {
    this.router.navigate(['script',script.compound_id[0],script.compound_id[1]]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackBy(index: number,item: KeyValue<string,Record<string,ScriptModel>>) {
    return `${item.key}/${Object.keys(item.value).length}}`;
  }

}
