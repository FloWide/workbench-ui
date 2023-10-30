import { KeyValue } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '@components/dialogs/confirm-dialog/confirm-dialog.component';
import { PythonServiceModel, PythonServices, PythonServiceState } from '@core/services/python-service/python-service.model';
import { AppState, Select, UserActions } from '@core/store';
import { PythonServiceActions } from '@core/store/python-service/python-service.action';
import { RepositoryActions } from '@core/store/repo/repo.action';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-services-board',
  templateUrl: './services-board.component.html',
  styleUrls: ['./services-board.component.scss']
})
export class ServicesBoardComponent implements OnInit,OnDestroy {


  private destroy$ = new Subject();

  @Input() filter: string = '';

  services: PythonServices

  filteredService: PythonServiceModel = null;

  filteredServiceValue: {[k:string]:PythonServiceModel} = {};

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private actions$: Actions,
    private router: Router
  ) {
    this.filteredService = this.router.getCurrentNavigation().extras?.state?.service
    if (this.filteredService) {
      this.filteredServiceValue = {
        [this.filteredService.version]:this.filteredService
      }
    }
   }
  

  ngOnInit(): void {
    this.store.dispatch(PythonServiceActions.GetServices());
    this.store.dispatch(UserActions.GetMe());
    this.store.select(Select.services).pipe(
      takeUntil(this.destroy$)
    ).subscribe((services) => {
      this.services = services;
    });

    this.actions$.pipe(
      ofType(RepositoryActions.DeleteRepositorySuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.store.dispatch(PythonServiceActions.GetServices())
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackBy(index: number,item : KeyValue<string,Record<string,PythonServiceModel>>) {
    return `${item.key}/${Object.keys(item.value).length}}`;
  }

}
