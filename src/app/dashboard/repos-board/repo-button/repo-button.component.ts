import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RepositoryGitService } from '@core/services/repo/repo-git.service';
import { GitAnalyzeResults, GitState, RepositoryModel } from '@core/services/repo/repo.model';
import { RepositoryService } from '@core/services/repo/repo.service';
import { AppState, Select } from '@core/store';
import { RepositoryActions } from '@core/store/repo/repo.action';
import { Actions,ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CreateReleaseDialogComponent } from '../create-release-dialog/create-release-dialog.component';
import { ReleasesDialogComponent, ReleasesDialogData } from '../releases-dialog/releases-dialog.component';

type Tag = {name:string,time:number};

@Component({
  selector: 'app-repo-button',
  templateUrl: './repo-button.component.html',
  styleUrls: ['./repo-button.component.scss']
})
export class RepoButtonComponent implements OnDestroy,OnInit{

  private _repo: RepositoryModel = null;

  private destroy$ = new Subject();

  @Output() edit = new EventEmitter<RepositoryModel>();
  @Output() fork = new EventEmitter<RepositoryModel>();
  @Output() delete = new EventEmitter<RepositoryModel>();

  @Output() update = new EventEmitter<RepositoryModel>();

  @Input() set repo(value: RepositoryModel) {
    this._repo = value
    this.forkParent$ = this.store.select(Select.repoById,this.repo?.forked_from_id).pipe(
      takeUntil(this.destroy$)
    )
    this.checkUpdate()
    this.getTags();
    this.getGitState();
  };

  get repo() {
    return this._repo
  }

  GIT_ANALYZE_RESULTS = GitAnalyzeResults

  forkParent$: Observable<RepositoryModel> = null;

  upstream_results : GitAnalyzeResults = GitAnalyzeResults.UP_TO_DATE;
  
  tags: Tag[] = []

  gitState: GitState = null;

  constructor(
    private store: Store<AppState>,
    private repoService: RepositoryService,
    private repoGitService: RepositoryGitService,
    private dialog: MatDialog,
    private actions$: Actions
  ) { }


  ngOnInit(): void {
      this.actions$.pipe(
        ofType(RepositoryActions.UpdateRepositorySuccess),
        filter((action) => action.id === this.repo.git_service_id),
        takeUntil(this.destroy$)
      ).subscribe((action) => {
        this.upstream_results = GitAnalyzeResults.UP_TO_DATE;
        this.getTags();
      });
      this.actions$.pipe(
        ofType(RepositoryActions.CreateRepositoryReleaseSuccess),
        filter((action) => action.id === this.repo.git_service_id),
        takeUntil(this.destroy$)
      ).subscribe((action) => {
        this.getTags();
      })
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async checkUpdate() {
    try{
      this.upstream_results = (await this.repoService.checkRepoUpdate(this.repo.git_service_id).toPromise()).status;
    } catch {
      this.upstream_results = GitAnalyzeResults.UP_TO_DATE;
    }
  }

  private async getTags() {
    try {
      this.tags = await this.repoGitService.getGitTags(this.repo.git_service_id).toPromise()
      this.tags.sort((a,b) => b.time - a.time)
    } catch {
      this.tags = []
    }
  }

  private async getGitState() {
    try {
      this.gitState = await this.repoGitService.getGitState(this.repo.git_service_id).toPromise()
    } catch {
      this.gitState = null;
    }
  }

  openReleaseList() {
    const dialog = this.dialog.open<ReleasesDialogComponent,ReleasesDialogData>(ReleasesDialogComponent,{
      data:{
        tags:this.tags,
        repo:this.repo
      }
    })
  }

  async createRelease() {
    const result = await this.dialog.open<CreateReleaseDialogComponent,string[],string>(
      CreateReleaseDialogComponent,
      {
        data:this.tags.map((t) => t.name)
      }
    ).afterClosed().toPromise();

    if (result) {
      this.store.dispatch(RepositoryActions.CreateRepositoryRelease({id:this.repo.git_service_id,tagName:result}));
    }

  }

}
