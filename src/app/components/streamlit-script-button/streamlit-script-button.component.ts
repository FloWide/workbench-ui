import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ScriptModel, ScriptsService } from '@core/services';
import { GitAnalyzeResults } from '@core/services/repo/repo.model';
import { UserModel } from '@core/services/user/user.model';
import { AppState, Select } from '@core/store';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



export enum ScriptActions {
  RUN_IN_FULLSCREEN = "RUN_IN_FULLSCREEN",
  DETAILS = "DETAILS"
}


type Scripts =  {[k:string]:ScriptModel};

@Component({
  selector: 'app-streamlit-script-button',
  templateUrl: './streamlit-script-button.component.html',
  styleUrls: ['./streamlit-script-button.component.scss']
})
export class StreamlitScriptButtonComponent implements OnInit,OnDestroy {

  private destroy$ = new Subject();

  private _scripts: Scripts = {};

  private _script: ScriptModel = null

  sortedScripts: ScriptModel[] = [];

  @Input() set scripts (value:Scripts) {
    this._scripts = value;
    this.sortedScripts = Object.values(this.scripts).sort((a,b) => b.created_at - a.created_at);
    this.script = this.sortedScripts[0];
  };

  get scripts() {
    return this._scripts;
  }

  set script(script: ScriptModel) {
    this._script = script
    this.image404 = false;
    this.scriptImage = this.scriptService.logo(script.compound_id,script.version)
  }
  get script() {
    return this._script
  }

  @Output() scriptClick = new EventEmitter<ScriptModel>();
  @Output() actionClick = new EventEmitter<[ScriptModel,ScriptActions]>();

  scriptImage: string = null;

  ACTIONS = ScriptActions;

  image404:boolean = false;

  GIT_ANALYZE_RESULTS = GitAnalyzeResults;

  upstream_results : GitAnalyzeResults = GitAnalyzeResults.UP_TO_DATE;

  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };

  me: UserModel = null;

  constructor(
    private scriptService: ScriptsService,
    private store: Store<AppState>
  ) { 
  }
  

  ngOnInit(): void {
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

  onContextMenu(event : MouseEvent) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

}
