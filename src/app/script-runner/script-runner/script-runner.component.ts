import { ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ConnectorModel, ScriptModel, ScriptsService, ScriptState } from '@core/services';
import { AppState, Select } from '@core/store';
import { ScriptActions } from '@core/store/script/script.action';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { interval, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'src/app/utils/logger';


@Component({
  selector: 'app-script-runner',
  templateUrl: './script-runner.component.html',
  styleUrls: ['./script-runner.component.scss']
})
export class ScriptRunnerComponent implements OnInit,OnDestroy{


  private destroy$ = new Subject();

  @Input() header = true;

  scriptModel: ScriptModel = null;

  currentScriptState: ScriptState = 'starting';

  url = '';

  frameRefresh: boolean = false;

  showTerminal: boolean = false;

  private changeUrlPort$ = new Subject<number>();

  private dcm: ConnectorModel = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private actions$: Actions,
    public scriptService: ScriptsService,
    private cd: ChangeDetectorRef,
  ) { }
  

  ngOnInit(): void {
    this.store.dispatch(ScriptActions.GetScripts());

    this.actions$.pipe(
      ofType(ScriptActions.GetScriptsSuccess),
      switchMap(() => this.route.params),
      map((params) => [params["name"],params["version"]] as [string,string]),
      withLatestFrom(this.store.select(Select.selectedDcmConnection)),
      tap(([id,connectorModel]) => {
        this.store.dispatch(ScriptActions.RunScript({
          compound_id:id,
          overrides:{
            env:{
              "DCM":connectorModel.api_base_url
            }
          }
        }));
        this.currentScriptState = 'starting'
      }),
      switchMap(([id,connectorModel]) => {
        return this.store.select(Select.scriptByCompoundId,id);
      }),
      tap((script) => {
        if (!script)
          this.router.navigate(['404'],{skipLocationChange:true});
      }),
      filter<ScriptModel>(Boolean),
      takeUntil(this.destroy$),
    ).subscribe(this.scriptObserver.bind(this));
    
    this.changeUrlPort$.pipe(
      switchMap((port) => {
        return this.route.queryParams.pipe(
          map((params) => [port,params])
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe(([port,params]: [number,Params]) => {
      this.url = this.scriptService.getIframeUrl(port,params); 
      this.refresh();  
    });

    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe((params) => {
      if (params.h !== undefined)
        this.header = params.h !== 'false';
    });

    interval(2000).pipe(
      takeUntil(this.destroy$),
      filter(() => !!this.scriptModel && this.scriptModel.type == 'python'),
    ).subscribe(() => {
      this.store.dispatch(ScriptActions.GetScript({compound_id:this.scriptModel.compound_id}));
    });

    this.store.select(Select.selectedDcmConnection).pipe(
      takeUntil(this.destroy$)
    ).subscribe((dcm) => {
      this.dcm = dcm;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.scriptModel)
      this.store.dispatch(ScriptActions.StopScript({compound_id:this.scriptModel.compound_id}));
  }

  scriptControltClick() {
    if (this.scriptModel?.state == 'active')
    {
      this.store.dispatch(ScriptActions.StopScript({compound_id:this.scriptModel.compound_id}));
      if (this.scriptModel.type === 'streamlit') {
        this.router.navigate(['apps'])
      }
    }
    else {
      this.store.dispatch(ScriptActions.RunScript({
        compound_id:this.scriptModel.compound_id,
        overrides:{
          env:{
            "DCM":this.dcm?.api_base_url
          }
        }
      }));
      this.currentScriptState = 'starting';
    }
  }

  refresh() {
    this.frameRefresh = true;

    setTimeout(() => {
        this.frameRefresh = false;
        this.cd.detectChanges();
    }, 10);

    this.cd.detectChanges();
  }

  refreshUrl() {
    if (this.scriptModel)
      this.changeUrlPort$.next(this.scriptModel.port);
  }

  @HostListener('window:keydown', ['$event'])
  toggleTerminal(event: KeyboardEvent) {
    if ( event.ctrlKey && event.altKey && event.key == 't')
      this.showTerminal = !this.showTerminal
  }

  private scriptObserver(script: ScriptModel) {

    if(script.port !== this.scriptModel?.port) {
      this.changeUrlPort$.next(script.port)
    }
    this.scriptModel = script;

    switch(this.scriptModel.state) {
      case 'active':
        if (this.currentScriptState !== 'active') {
          this.currentScriptState = 'starting';
          setTimeout(() => {
            this.currentScriptState = 'active'
            this.refresh()
          },1500);
        }
        break;
      case 'inactive':
        this.currentScriptState = this.scriptModel.state;
        break;
      default:
        this.currentScriptState = this.scriptModel.state;
        break;
    }
    Logger.logMessage("Running script",this.scriptModel);
  }
}
