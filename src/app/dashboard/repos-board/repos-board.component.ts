import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '@components/dialogs/confirm-dialog/confirm-dialog.component';
import { Repositories, RepositoryForkModel, RepositoryModel } from '@core/services/repo/repo.model';
import { Users } from '@core/services/user/user.model';
import { AppState, Select, UserActions } from '@core/store';
import { RepositoryActions } from '@core/store/repo/repo.action';
import { Actions,ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ForkDialogComponent, ForkDialogData } from '../fork-dialog/fork-dialog.component';
import { UpdateDialogComponent } from '../update-dialog/update-dialog.component';

@Component({
  selector: 'app-repos-board',
  templateUrl: './repos-board.component.html',
  styleUrls: ['./repos-board.component.scss']
})
export class ReposBoardComponent implements OnInit,OnDestroy {

  private destroy$ = new Subject();

  repos: Repositories = {}

  private users: Users = null;


  constructor(
    private store: Store<AppState>,
    private router: Router,
    private dialog: MatDialog,
    private actions$: Actions,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.store.dispatch(RepositoryActions.GetRepositories());
    this.store.dispatch(UserActions.GetUsers());
    this.store.select(Select.repos).pipe(
      takeUntil(this.destroy$)
    ).subscribe((repos) => {
      this.repos = repos;
    });

    this.store.select(Select.users).pipe(
      takeUntil(this.destroy$)
    ).subscribe((users) => {
      this.users = users;
    });

    this.actions$.pipe(
      ofType(RepositoryActions.UpdateRepositorySuccess),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      this.snackBar.open('Update successful!')
    });

    this.actions$.pipe(
      ofType(RepositoryActions.UpdateRepositoryError),
      takeUntil(this.destroy$)
    ).subscribe(async (action) => {
      if (action.status === 500)
        this.snackBar.open("Failed to update repository")
      else
        await this.onFailedUpdate(action.id,action.message);
    });

    this.actions$.pipe(
      ofType(RepositoryActions.CreateRepositoryReleaseSuccess,RepositoryActions.CreateRepositoryReleaseError),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      if (action.type === RepositoryActions.CreateRepositoryReleaseSuccess.type) {
        this.snackBar.open(`Created release ${action.tagName} for ${this.repos[action.id].name}`)
      } else {
        this.snackBar.open(`Failed to create release ${action.tagName} for ${this.repos[action.id].name}\n${action.message}`,'Ok',{
          duration:null
        })
      }
    });

    this.actions$.pipe(
      ofType(RepositoryActions.DeleteRepositoryReleaseSuccess,RepositoryActions.DeleteRepositoryReleaseError),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      if (action.type === RepositoryActions.DeleteRepositoryReleaseSuccess.type) {
        this.snackBar.open(`Deleted release ${action.tagName}`)
      } else {
        this.snackBar.open(`Failed to delete release ${action.tagName}`)
      }
    })

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRepositoryEdit(repo: RepositoryModel) {
    this.router.navigate(['edit',repo.git_service_id])
  }

  onRepositoryUpdate(repo: RepositoryModel) {
    this.store.dispatch(RepositoryActions.UpdateRepository({id:repo.git_service_id,update:{}}));
  }

  async onRepositoryFork(repo: RepositoryModel) {
    const result = await this.dialog.open<ForkDialogComponent,ForkDialogData,RepositoryForkModel>(ForkDialogComponent,{
      data:{
        name:repo.name,
        users:this.users
      }
    }).afterClosed().toPromise();

    if (result) {
      this.store.dispatch(RepositoryActions.ForkRepository({id:repo.git_service_id,forkModel:result}));
    }
  }

  async onRepositoryDelete(repo: RepositoryModel) {
    const result = await this.dialog.open<ConfirmDialogComponent,ConfirmDialogData,boolean>(ConfirmDialogComponent,{
      data:{
        color:'warn',
        message:`Are you sure you want to delete ${repo.name}? <br> This will also delete all releases made from this repository! <br> This cannot be undone!`,
        submitButton:'Delete',
        title:'Delete repository'
      }
    }).afterClosed().toPromise();
    if (result)
      this.store.dispatch(RepositoryActions.DeleteRepository({id:repo.git_service_id}));
  }

  async onFailedUpdate(id: number,message: string) {
    const snackBarDismiss = await this.snackBar.open(
      `User action required to update ${this.repos[id].name} `,
      "Ok",
      {
        duration:0
      }
    ).afterDismissed().toPromise();

    if ( !snackBarDismiss.dismissedByAction )
        return;
    
    const result = await this.dialog.open(UpdateDialogComponent,{
      data:message,
    }).afterClosed().toPromise();

    if (result) {
      this.store.dispatch(RepositoryActions.UpdateRepository({id:id,update:result}));
    }
  }

}
