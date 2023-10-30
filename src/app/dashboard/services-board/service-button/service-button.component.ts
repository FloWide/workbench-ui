import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { PythonServiceModel, PythonServiceState } from '@core/services/python-service/python-service.model';
import { AppState, Select } from '@core/store';
import { PythonServiceActions } from '@core/store/python-service/python-service.action';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { interval, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { UserProfile } from '@core/services';
import { UserModel } from '@core/services/user/user.model';


type Services = {[k:string]:PythonServiceModel}

@Component({
  selector: 'app-service-button',
  templateUrl: './service-button.component.html',
  styleUrls: ['./service-button.component.scss']
})
export class ServiceButtonComponent implements OnInit,OnDestroy {

  private destroy$ = new Subject();

  monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    automaticLayout:true,
    readOnly:true,
    minimap:{
      enabled:false
    }
  }

  private _services: Services = {}

  private _service: PythonServiceModel = null;

  sortedServices: PythonServiceModel[] = [];

  @Input() set services(value: Services) {
    if (!value) return;
    this._services = value;
    this.sortedServices = Object.values(this._services).sort((a,b) => b.created_at - a.created_at);
    this.serviceModel = this.sortedServices[0];
  }

  get services() {
    return this._services;
  }

  set serviceModel(value:PythonServiceModel) {
    this._service = value
  };

  get serviceModel() {
    return this._service;
  }

  logs: string = ""

  isExpanded: boolean = false;

  me: UserModel = null;
  constructor(
    private actions$: Actions,
    private store: Store<AppState>
  ) { }
  

  ngOnInit(): void {
    this.actions$.pipe(
      ofType(PythonServiceActions.GetServiceLogsSuccess),
      filter((action) => action.compound_id.toString() === this.serviceModel.compound_id.toString())
    ).subscribe((action) => {
      this.logs = action.logs;
    });

    interval(10000).pipe(
      takeUntil(this.destroy$),
      filter(() => this.serviceModel?.enabled && this.isExpanded)
    ).subscribe(() => {
      this.store.dispatch(PythonServiceActions.GetServiceLogs({compound_id:this.serviceModel.compound_id}));
      this.store.dispatch(PythonServiceActions.GetService({compound_id:this.serviceModel.compound_id}));
    });

    this.actions$.pipe(
      ofType(PythonServiceActions.DisableServiceSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.store.dispatch(PythonServiceActions.GetServiceLogs({compound_id:this.serviceModel.compound_id}))
    });

    this.store.select(Select.me).pipe(
      takeUntil(this.destroy$)
    ).subscribe((me) => {
      this.me = me;
    })

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleEnabed(event: MatSlideToggleChange) {
    if (event.checked)
      this.store.dispatch(PythonServiceActions.EnableService({compound_id:this.serviceModel.compound_id}));
    else
      this.store.dispatch(PythonServiceActions.DisableService({compound_id:this.serviceModel.compound_id}));
  }

  expandedChanged(e: boolean) {
    this.isExpanded = e;
    if(this.isExpanded)
      this.store.dispatch(PythonServiceActions.GetServiceLogs({compound_id:this.serviceModel.compound_id}));
  }

  onRestart() {
    this.store.dispatch(PythonServiceActions.RestartService({compound_id:this.serviceModel.compound_id}));
  }

  getStateColor(state: PythonServiceState ) {
    switch (state) {
      case 'active':
        return '#00A676';
      case 'inactive':
        return 'grey'
      case 'starting':
        return '#ECA72C'
      case 'failed to start':
        return '#DB222A';
    }
  }

  getRunningSince() {
    if (!this.serviceModel?.started_at) return '';
    return moment.unix(this.serviceModel.started_at).fromNow();
  }
}
