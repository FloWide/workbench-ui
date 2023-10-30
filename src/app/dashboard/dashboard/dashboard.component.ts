import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabLink } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { ScriptsService } from '@core/services';
import { Repositories, RepositoryCreationModel, RepositoryModel } from '@core/services/repo/repo.model';
import { AppState, Select } from '@core/store';
import { PythonServiceActions } from '@core/store/python-service/python-service.action';
import { RepositoryActions } from '@core/store/repo/repo.action';
import { ScriptActions } from '@core/store/script/script.action';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, Subject,zip } from 'rxjs';
import { mergeMap, switchMap, takeUntil,take, map,first, filter } from 'rxjs/operators';
import { CreateNewDialogComponent } from '../create-new-dialog/create-new-dialog.component';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit,OnDestroy,AfterViewInit {

  private destroy$ = new Subject();

  private repos: Repositories = {};

  loading = false;

  reposCount: number = 0;

  appsCount: number = 0;

  servicesCount: number = 0;

  @ViewChildren(RouterLinkWithHref) links: QueryList<RouterLinkWithHref>;

  constructor(
    private dialogService: MatDialog,
    private store: Store<AppState>,
    private actions$: Actions,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }  
  ngAfterViewInit(): void {

    this.links.changes.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      if (this.links.first) {
        this.router.navigateByUrl(this.links.first.urlTree)
      }
    });
  }
  ngOnInit(): void {
    this.store.dispatch(RepositoryActions.GetRepositories());
    this.store.dispatch(ScriptActions.GetScripts());
    this.store.dispatch(PythonServiceActions.GetServices());
    this.store.select(Select.repos).pipe(
      takeUntil(this.destroy$)
    ).subscribe((repos) => {
      this.repos = repos;
      this.reposCount = Object.keys(this.repos).length
    });

    this.store.select(Select.scripts).pipe(
      takeUntil(this.destroy$)
    ).subscribe((scripts) => {
      this.appsCount = Object.keys(scripts).length
    });

    this.store.select(Select.services).pipe(
      takeUntil(this.destroy$)
    ).subscribe((services) => {
      this.servicesCount = Object.keys(services).length
    });

    this.actions$.pipe(
      ofType(RepositoryActions.CreateRepositorySuccess,RepositoryActions.CreateRepositoryError),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      this.loading = false;

      if(action.type === RepositoryActions.CreateRepositorySuccess.type) {
        this.snackBar.open(`Created new repository ${action.repo.name}`);
        this.router.navigate(['repos']);
      } else {
        this.snackBar.open(`Failed to create repository`);
      }

    });

    this.actions$.pipe(
      ofType(RepositoryActions.CreateRepositoryReleaseSuccess,RepositoryActions.DeleteRepositoryReleaseSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.store.dispatch(ScriptActions.GetScripts());
      this.store.dispatch(PythonServiceActions.GetServices());
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search() {
    this.dialogService.open(SearchDialogComponent,{
      position:{
        top:'5%'
      }
    });
  }

  async onCreateNew() {
    const result = await this.dialogService.open<CreateNewDialogComponent,string[],RepositoryCreationModel>(CreateNewDialogComponent,
      {
        data:Object.values(this.repos || {}).map((r: RepositoryModel) => r.name)
      }).afterClosed().toPromise();
    if (result) {
      this.store.dispatch(RepositoryActions.CreateRepository({model:result}));
      this.loading = true
    }
  }

}