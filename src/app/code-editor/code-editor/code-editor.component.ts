import { Component, OnInit, NgZone, Output, EventEmitter, Input, OnDestroy, ElementRef, Inject, OnChanges, SimpleChanges, InjectionToken, Renderer2 } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RepositoryModel } from '@core/services/repo/repo.model';
import { AppState, Select } from '@core/store';
import { CodeEditorActions } from '@core/store/code-editor/code-edior.action';
import { CodeTab } from '@core/store/code-editor/code-editor.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ComponentContainer, Tab } from 'golden-layout';
import { BehaviorSubject, Subject } from 'rxjs';
import { delay, filter, map, take, takeUntil, } from 'rxjs/operators';
import { ComponentContainerInjectionToken, GlComponentDirective } from 'src/app/golden-layout';
import { Logger } from 'src/app/utils/logger';
import { CodeEditorTextModelsService } from './code-editor-text-models.service';
import * as monaco from 'monaco-editor';

export type EditorOptions = monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;

export const MonacoEditorGlobalConfig = new InjectionToken<EditorOptions>('MonacoEditorGlobalConfig');

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent extends GlComponentDirective implements OnDestroy, OnChanges {

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    language: 'python',
    automaticLayout: true,
    minimap: {
      enabled: false
    },
  };

  private editor: monaco.editor.IStandaloneCodeEditor = null;

  private destroy$ = new Subject();

  private repo: RepositoryModel;

  @Input() openedFile: CodeTab;

  get monacoEditor() {
    return this.editor;
  }

  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private store: Store<AppState>,
    private actions$: Actions,
    @Inject(ComponentContainerInjectionToken) private container: ComponentContainer,
    @Inject(MonacoEditorGlobalConfig) private editorConfig$: BehaviorSubject<EditorOptions>,
    private textModels: CodeEditorTextModelsService,
    elRef: ElementRef
  ) {
    super(elRef.nativeElement)
    elRef.nativeElement.style.overflow = '';
    this.container.on('resize', this.layout.bind(this));
    this.container.on('tab', this.setupTab.bind(this));
    this.container.on('show', () => {
      this.store.dispatch(CodeEditorActions.FocusTab({ tab: this.openedFile }));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    Logger.logMessage('on changes');
    if (changes.openedFile && this.editor) {
      this.updateEditor();
    }
  }

  ngOnDestroy(): void {

    this.editor.dispose();

    this.destroy$.next();
    this.destroy$.complete();
  }

  editorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.initCommandsAndActions();

    this.store.select(Select.editingRepo).pipe(
      takeUntil(this.destroy$)
    ).subscribe((r) => {
      this.repo = r
      this.updateEditor();
    });
    this.editorConfig$.pipe(
      takeUntil(this.destroy$),
    ).subscribe((options) => {
      const opts = this.editor.getOptions();
      this.editor.updateOptions({...opts,...options});
    });
    this.editor.onDidChangeModelContent(this.codeChanged.bind(this));
    this.editor.focus();
  }

  codeChanged() {
    const currentModel = this.textModels.getModel(this.openedFile.path, this.repo.git_service_id);
    if (currentModel?.originalCode === null || currentModel?.originalCode === undefined)
      return
    this.openedFile.modified = currentModel?.model?.getValue() !== currentModel?.originalCode;
    this.store.dispatch(CodeEditorActions.SetTabModified({ tab: this.openedFile }));
  }

  public layout() {
    this.editor?.layout();
  }

  public saveCode() {
    if (this.openedFile)
      this.saveToServer();
  }

  private updateEditor() {
    if (!this.openedFile) {
      this.editor.setModel(null);
      Logger.logWarning('No file set for editor');
      return;
    }

    const model = this.textModels.getModel(this.openedFile.path, this.repo.git_service_id,this.repo.root_path);
    this.editor.setModel(model.model);
  }

  private initCommandsAndActions() {
    this.editor.addAction({
      id: 'SAVE_TO_SERVER',
      label: 'Save to server',
      run: () => this.saveToServer(),
      keybindings: [(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS)]
    });

    this.editor.addAction({
      id: 'TOGGLE_LINE_WRAP',
      label: 'Toggle Line Wrap',
      run: () => {
        const opts = this.editor.getOptions();
        this.editorConfig$.next({wordWrap: opts.get(monaco.editor.EditorOption.wordWrap) === 'off' ? 'on' : 'off' });
      }
    });

    this.editor.addAction({
      id: 'TOGGLE_MINIMAP',
      label: 'Toggle Minimap',
      run: () => {
        const opts = this.editor.getOptions();
        const minimapState = opts.get(monaco.editor.EditorOption.minimap).enabled;
        this.editorConfig$.next({ minimap: { enabled: !minimapState } });
      }
    })

  }

  private saveToServer() {
    this.store.dispatch(CodeEditorActions.SendEditMessage({
      msg: {
        action: 'update',
        base64encoded: false,
        content: this.editor.getModel().getValue(),
        file_path: this.openedFile.path,
        previous_path: ""
      }
    }));
    const sub = this.actions$.pipe(
      ofType(CodeEditorActions.WebSocketEditResponse),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.store.dispatch(CodeEditorActions.GetFileContent({ path: this.openedFile.path, repo:this.repo.git_service_id }));
      sub.unsubscribe();
    })
    this.ngZone.run(() => {
      this.snackBar.open('Saved', null, {
        duration: 1500,
        verticalPosition: 'top'
      });
    });
  }

  private setupTab(tab: Tab) {

    const closeTabButton = tab.element.querySelector('.lm_close_tab') as HTMLDivElement;
    this.store.select(Select.openCodeTabs).pipe(
      takeUntil(this.destroy$),
      map((value) => value[this.openedFile.path]),
      filter<CodeTab>(Boolean),
      map((tab) => tab.modified)
    ).subscribe((modified) => {
      if(modified) {
        closeTabButton.style.backgroundColor = '#1a1a1a';
        closeTabButton.style.backgroundImage = 'url()';
        closeTabButton.style.borderRadius = '100% 100%';
      }
      else {
        closeTabButton.style.backgroundColor = null;
        closeTabButton.style.backgroundImage = null;
        closeTabButton.style.borderRadius = null;
      }
        
    })
  }

  public focus() {
    this.container.focus();
  }

  public close() {
    this.container.close();
  }
}



