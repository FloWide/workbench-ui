/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import { Injectable, OnDestroy } from '@angular/core';
import { AppState } from '@core/store';
import { CodeEditorActions } from '@core/store/code-editor/code-edior.action';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Logger } from 'src/app/utils/logger';
import * as monaco from 'monaco-editor';

export interface MonacoTextModels {
  [key: string]: {
    model: monaco.editor.ITextModel;
    originalCode: string;
    lastViewState?: any;
  };
}

@Injectable()
export class CodeEditorTextModelsService implements OnDestroy {

  private textModels: MonacoTextModels = {}

  private destroy$ = new Subject();

  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
  ) {

    this.actions$.pipe(
      ofType(CodeEditorActions.GetFileContentSuccess),
      takeUntil(this.destroy$)
    ).subscribe(this.handleFileContentSucces.bind(this));
    
    this.actions$.pipe(
      ofType(CodeEditorActions.GetFileContentError),
      takeUntil(this.destroy$)
    ).subscribe(this.handleFileContentError.bind(this));

    this.actions$.pipe(
      ofType(CodeEditorActions.CloseTab),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      const model = this.textModels[action.tab.path];
      model.model.dispose();
      delete this.textModels[action.tab.path];
    })
  }


  ngOnDestroy(): void {
    Logger.logMessage('text model service destroyed');
    for(const [k,v] of Object.entries(this.textModels)) {
      v.model.dispose();
      delete this.textModels[k];
    }
    this.destroy$.next();
    this.destroy$.complete();
  }


  getModel(file: string, repo: number,root_path: string = '') {
    Logger.logMessage(this.textModels)
    Logger.logMessage('file',file,'project',repo);
    if (!(file in this.textModels)) {
      Logger.logMessage('new model')
      const model = monaco.editor.createModel("", "", monaco.Uri.file(`${root_path}/${file}`));
      this.textModels[file] = { model: model, originalCode: null };
      this.store.dispatch(CodeEditorActions.GetFileContent({ repo: repo, path: file }));
      return this.textModels[file];
    } else {
      Logger.logMessage('old model')
      return this.textModels[file]
    }
  }

  destroyModel(file: string) {
    if (!(file in this.textModels)) return;
    this.textModels[file].model.dispose();
    delete this.textModels[file];
  }

  private handleFileContentSucces(action: { project: number; path: string; content: string }) {
    const textModel = this.getModel(action.path, action.project);

    if (textModel) {
      textModel.originalCode = action.content;
        textModel.model.pushEditOperations(
          [new monaco.Selection(0,0,0,0)],
          [{
            range: textModel.model.getFullModelRange(),
            text: action.content,
            forceMoveMarkers:textModel.model.getValue() === '' // only forcemovemarkes on empty model so the selection is kept after updating the content
          }],
          () => [new monaco.Selection(0,0,0,0)]
        );
    }
  }

  private handleFileContentError(action: {repo:number; path: string}) {
    const textModel = this.getModel(action.path,action.repo);

    if (textModel && textModel.model) {
      textModel.model.dispose();
      textModel.model = null;
    }
  }
}
