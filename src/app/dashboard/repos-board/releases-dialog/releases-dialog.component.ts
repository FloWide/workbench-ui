import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RepositoryModel } from '@core/services/repo/repo.model';
import { AppState } from '@core/store';
import { RepositoryActions } from '@core/store/repo/repo.action';
import { ThemeService } from '@material/theme.service';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

export interface ReleasesDialogData {
  tags: {name:string,time:number}[];
  repo: RepositoryModel
}

@Component({
  selector: 'app-releases-dialog',
  templateUrl: './releases-dialog.component.html',
  styleUrls: ['./releases-dialog.component.scss']
})
export class ReleasesDialogComponent implements OnInit,OnDestroy {

  private destroy$ = new Subject();

  tags: {name:string,time:number}[] = []

  private repo: RepositoryModel = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReleasesDialogData,
    private store: Store<AppState>,
    private actions$: Actions
  ) { 
    this.tags = data.tags;
    this.repo = data.repo
  }
  

  ngOnInit(): void {
    this.actions$.pipe(
      ofType(RepositoryActions.DeleteRepositoryReleaseSuccess),
      filter((action) => action.id === this.repo?.git_service_id),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      this.tags.splice(
        this.tags.findIndex((value) => value.name === action.tagName),
        1
      )
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteRelease(item: string) {
    this.store.dispatch(RepositoryActions.DeleteRepositoryRelease({id:this.repo?.git_service_id,tagName:item}))
  }

  prettyTime(time: number) {
    return moment.unix(time).fromNow();
  }
}
