import { Injectable } from '@angular/core';
import { ScriptModel, ScriptsService } from '@core/services';
import { AppType } from '@core/services/repo/repo.model';
import { AppState, Select } from '@core/store';
import { RunnerState } from '@core/store/code-editor/code-editor.state';
import { Store } from '@ngrx/store';
import { Subject,BehaviorSubject } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { Logger } from 'src/app/utils/logger';

@Injectable()
export class PreviewHandlerService {


  isPoputOpen$ = new BehaviorSubject<boolean>(false);

  url$ = new BehaviorSubject<string>(null);

  private url: string = null;

  private childWindow: Window = null;

  constructor(
    private store: Store<AppState>,
    private scriptService: ScriptsService
  ) { 
   // this.store.select(Select.editingRepo).subscribe(this.handleProjectUpdate.bind(this));
   this.store.select(Select.runnerState).pipe(
     filter<RunnerState>(Boolean),
   ).subscribe(this.handleProjectUpdate.bind(this));
  }


  openPoputWindow() {
    if(!this.url) return;
    this.childWindow = window.open(this.url,'_blank','poput');
    this.isPoputOpen$.next(true);
    const checkChild = setInterval(() => {
      if(this.childWindow.closed) {
        this.childWindow = null;
        this.isPoputOpen$.next(false);
        clearInterval(checkChild);
      }
    },500)
  }

  closePoputWindow() {
    if(!this.childWindow) return;
    this.childWindow.close();
    this.isPoputOpen$.next(false);
  }

  private async handleProjectUpdate(script:RunnerState) {
    if(script?.port) {
      this.url = this.scriptService.getIframeUrl(script.port);
      Logger.logMessage(this.url);
      this.url$.next(this.url);
    }
  }
}
