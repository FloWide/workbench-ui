import { AfterViewInit, Component, HostListener, Inject, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InputDialogComponent, InputDialogData } from '@components/dialogs/input-dialog/input-dialog.component';
import { AppState, Select,} from '@core/store';
import { MenuBarComponent, MenuItem, TopLevelMenuItem } from '@material/menu-bar/menu-bar.component';
import { PickerDialogComponent, PickerDialogData } from '@material/picker-dialog/picker-dialog.component';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ComponentItem, ItemType, LayoutConfig, LayoutManager, RowOrColumn, Stack } from 'golden-layout';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { GoldenLayoutComponentService, GoldenLayoutHost } from 'src/app/golden-layout';
import { Logger } from 'src/app/utils/logger';
import { CodeEditorActions } from '../../core/store/code-editor/code-edior.action';
import { CodeEditorComponent, EditorOptions, MonacoEditorGlobalConfig } from '../code-editor/code-editor.component';
import { CommitDialogComponent } from '../commit-dialog/commit-dialog.component';
import { FileTreeComponent } from '../file-tree/file-tree.component';
import { PreviewHandlerService } from '../preview-frame/preview-handler.service';
import { PreviewRunnerComponent } from '../preview-frame/preview-runner/preview-runner.component';
import { createLayoutSelector, DEFAULT_LAYOUT_CONFIG, DEFAULT_LAYOUT_SELECTOR, MENU_BAR, TOOLBAR_ITEMS } from './layout-definitions';
import { flatten } from 'lodash';
import { CodeEditorTextModelsService } from '../code-editor/code-editor-text-models.service';
import { fileToBase64 } from '../utils';
import { Themes, ThemeService } from '@material/theme.service';
import { RepositoryFileEntry, RepositoryModel, WebsocketControlResponseMessage } from '@core/services/repo/repo.model';
import { CodeTab } from '@core/store/code-editor/code-editor.state';
import { RepositoryActions } from '@core/store/repo/repo.action';
import { TerminalComponent } from '../terminal/terminal.component';
import { TerminalBufferService } from '../terminal/terminal-buffer.service';
import { CodeEditorLspService } from '../code-editor/code-editor-lsp.service';
import { ToolBarComponent, ToolBarItem } from '@material/tool-bar/tool-bar.component';




@Component({
  selector: 'app-code-editor-page',
  templateUrl: './code-editor-page.component.html',
  styleUrls: ['./code-editor-page.component.scss'],
  providers: [
    CodeEditorTextModelsService,
    TerminalBufferService,
    CodeEditorLspService
  ]
})
export class CodeEditorPageComponent implements OnInit, OnDestroy {

  menuBarSetting = MENU_BAR;

  private destroy$ = new Subject();

  repo: RepositoryModel;

  fullScreen: boolean = true;

  showToolBar: boolean = true;

  showFileTree: boolean = true;

  showTerminal: boolean = false;

  toolBarItems = [...TOOLBAR_ITEMS];

  disableIframeMouse = false;

  websocketConnected = false;

  unsavedChanges$: Observable<boolean>;

  @ViewChild('glHost', { static: true }) glHost: GoldenLayoutHost

  @ViewChild('menuBar') menuBar: MenuBarComponent;

  @ViewChild('toolBar') toolBar: ToolBarComponent;


  private previewFrameOpened: boolean = false;

  private focusedTab: CodeTab;

  private selectedDcm: string;

  private editors = new Map<string, CodeEditorComponent[]>();

  private focusedEditor: CodeEditorComponent = null;

  private fileTree: FileTreeComponent = null;

  private terminal: TerminalComponent = null;

  private openDialog: MatDialogRef<any> = null;

  private lastChosenFile: string = null;

  private projectFiles: RepositoryFileEntry[] = [];

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private actions$: Actions,
    private router: Router,
    public injector: Injector,
    private glComponents: GoldenLayoutComponentService,
    private previewHandler: PreviewHandlerService,
    @Inject(MonacoEditorGlobalConfig) private editorConfig$: BehaviorSubject<EditorOptions>,
    private terminalBuffer: TerminalBufferService,
    private _: CodeEditorLspService
  ) {
    this.glComponents.registerComponent('editor', CodeEditorComponent);
    this.glComponents.registerComponent('file-tree', FileTreeComponent);
    this.glComponents.registerComponent('preview-runner', PreviewRunnerComponent);
    this.glComponents.registerComponent('terminal',TerminalComponent);
  }

  ngOnInit(): void {
    Logger.logMessage(this.toolBarItems);
    this.store.dispatch(RepositoryActions.GetRepositories());
    this.unsavedChanges$ = this.store.select(Select.codeEditorUnsavedChanges).pipe(takeUntil(this.destroy$));


    this.actions$.pipe(
      ofType(RepositoryActions.GetRepositoriesSuccess),
      switchMap(() => this.route.params),
      filter((params) => params["id"]),
      map((params) => params["id"]),
      tap((id) => this.store.dispatch(CodeEditorActions.ConnectToEditWebsocket({repo:id}))),
      switchMap(id => this.store.select(Select.repoById,id)),
      tap((repo) => {
        if (!repo)
          this.router.navigate(['404'],{skipLocationChange:true});
      }),
      filter<RepositoryModel>(Boolean),
      takeUntil(this.destroy$)
    ).subscribe((repo) => {
      this.repo = repo;
      this.store.dispatch(CodeEditorActions.SetRepo({repo:repo}));
      Logger.logMessage("Repository update", repo);
    })


    this.store.select(Select.repofiles).pipe(
      filter<RepositoryFileEntry[]>(Boolean),
      switchMap((files) => {
        return this.store.select(Select.editingRepo).pipe(
          filter<RepositoryModel>(Boolean),
          map((repo) => [files,repo])
        )
      }),
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(([files,repo]: [RepositoryFileEntry[],RepositoryModel]) => {
      const mainfile = Object.values(repo.apps_config.apps)[0].config.entry_file;
      const fileEntry = files.find((value) => value.path === mainfile)
      if (fileEntry)
        this.store.dispatch(CodeEditorActions.OpenTab({tab:fileEntry as any}));
    })

    this.store.select(Select.focusedCodeTab).pipe(
      takeUntil(this.destroy$),
      filter<CodeTab>(Boolean)
    ).subscribe((tab) => {
      this.focusedTab = tab;
      if(this.editors.has(tab.path)){
        Logger.logMessage("focusing tab",tab);
        try{
          this.editors.get(tab.path)[0].focus();
        } catch(e) {
          Logger.logWarning(e);
        }
      }
    });

    this.store.select(Select.repofiles).pipe(
      takeUntil(this.destroy$)
    ).subscribe((files) => {
      this.projectFiles = files;
    });

    this.actions$.pipe(
      ofType(CodeEditorActions.OpenTab),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      const row = (this.glHost.goldenLayout.rootItem.contentItems[1].contentItems[0] as RowOrColumn)
      const stack = row.contentItems[0] as Stack;
      if (stack)
        stack.addComponent('editor', { openedFile: action.tab }, action.tab?.path);
      else if(row) {
        row.addComponent('editor', { openedFile: action.tab }, action.tab?.path);
      } else {
        this.glHost.goldenLayout.addComponentAtLocation('editor', { openedFile: action.tab }, action.tab?.path, DEFAULT_LAYOUT_SELECTOR);
      }
    });

    this.actions$.pipe(
      ofType(CodeEditorActions.CloseTab),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      const editors = this.editors.get(action.tab.path);
      for(const editor of editors) {
        editor.close();
      }
    });

    this.store.select(Select.selectedDcmConnection).pipe(
      takeUntil(this.destroy$)
    ).subscribe((conn) => {
      this.selectedDcm = conn.api_base_url;
      if (this.focusedTab)
        this.runFile(null);
    });

    this.store.select(Select.editWebsocketState).pipe(
      takeUntil(this.destroy$)
    ).subscribe((connected) => {
      this.websocketConnected = connected;
      this.editorConfig$.next({ readOnly: !connected });
    });

    this.store.select(Select.runnerState).pipe(
      filter<WebsocketControlResponseMessage>(Boolean),
      takeUntil(this.destroy$)
    ).subscribe((state) => {
      if (state?.status === 'active') {
        this.toolBarItems = removeToolbarItem(this.toolBarItems,'RUN')
        this.toolBarItems = addToolbarItem(this.toolBarItems,{
          title:'Stop',
          id:'STOP',
          align:'center',
          display:{
              icon:'stop',
              color:'red',
              big:true
          }
        })
      } else if(state?.status === 'inactive') {
        this.toolBarItems = removeToolbarItem(this.toolBarItems,'STOP')
        this.toolBarItems = addToolbarItem(this.toolBarItems,{
          title:'Run',
          id:'RUN',
          align:'center',
          display:{
              icon:'play_arrow',
              color:'green',
              big:true
          }
        })
      }
    })

    this.actions$.pipe(
      takeUntil(this.destroy$),
      ofType(CodeEditorActions.ConnectToEditWebsocketError)
    ).subscribe(async () => {
      const result = await this.snackBar.open("Couldn't connect to websocket.There's probably a connection already open.", "Force connection", {
        verticalPosition: 'top',
        duration: 5000

      }).afterDismissed().pipe(take(1)).toPromise();

      if (result.dismissedByAction)
        this.store.dispatch(CodeEditorActions.ConnectToEditWebsocket({ repo: this.repo.git_service_id, force: true }))
    });

    this.previewHandler.isPoputOpen$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isOpen) => {
      if (!isOpen) {
        this.addPreviewRunner();
      }
    });

    this.actions$.pipe(
      ofType(CodeEditorActions.GetFileContentError),
      takeUntil(this.destroy$)
    ).subscribe((action) => {
      this.snackBar.open(`Failed got text content for file: ${action.path}`,'Ok',{
        verticalPosition:'top'
      });
    });

    this.actions$.pipe(
      ofType(CodeEditorActions.WebSocketControlResponse),
      takeUntil(this.destroy$)
    ).subscribe(async (action) => {
      if (action.msg.status === 'active') {
        if (action.msg.type === 'streamlit') {
          const poputOpened = await this.previewHandler.isPoputOpen$.pipe(take(1)).toPromise();
          if (!this.previewFrameOpened && !poputOpened) {
            this.addPreviewRunner();
          }
        } else {
          if (!this.showTerminal) {
            this.showTerminal = true;
            this.menuBar.setChecked('SHOW_TERMINAL',true);
            this.updateTerminalPanel();
          }
        }
      }
    });

    this.actions$.pipe(
      ofType(CodeEditorActions.CommitChangesSuccess,CodeEditorActions.CommitChangesError),
      takeUntil((this.destroy$))
    ).subscribe((action) => {
      if (action.type === CodeEditorActions.CommitChangesSuccess.type) {
        this.snackBar.open('Comitted changes!')
      } else {
        this.snackBar.open('Failed to commit changes!','Ok',{duration:null});
      }
    })

    this.glHost.goldenLayout.on('itemCreated', (args) => {
      if (args.target instanceof ComponentItem) {
        if (args.target.componentType === 'editor') {
          const component = args.target.component as CodeEditorComponent;
          this.focusedEditor = component;
          component.monacoEditor?.focus();
          if (this.editors.has(component.openedFile.path))
            this.editors.get(component.openedFile.path).push(component)
          else {
            this.editors.set(component.openedFile.path, [component]);
          }
        } else if (args.target.componentType === 'preview-runner') {
          this.previewFrameOpened = true;
        } else if (args.target.componentType === 'file-tree') {
          this.fileTree = args.target.component as FileTreeComponent;
        } else if (args.target.componentType === 'terminal') {
          this.terminal = args.target.component as TerminalComponent;
        }
      }
    });

    this.glHost.goldenLayout.on('itemDestroyed', (args) => {
      if (args.target instanceof ComponentItem) {
        if (args.target.componentType === 'editor') {
          const component = args.target.component as CodeEditorComponent;
          const array = this.editors.get(component.openedFile.path);
          array.splice(
            array.findIndex((v) => v === component),
            1
          );
          if(array.length === 0) {
            this.store.dispatch(CodeEditorActions.CloseTab({tab:component.openedFile}));
          }
        } else if (args.target.componentType === 'preview-runner') {
          this.previewFrameOpened = false;
        } else if (args.target.componentType === 'file-tree') {
          this.fileTree = null;
          this.showFileTree = false;
          this.menuBar.setChecked('SHOW_FILE_TREE', false);
        } else if (args.target.componentType === 'terminal') {
          this.terminal = null;
          this.showTerminal = false;
          this.menuBar.setChecked('SHOW_TERMINAL',false);
        }
      }
    });

    this.glHost.goldenLayout.on('focus', (args) => {
      Logger.logMessage(args)
      if (args.target instanceof ComponentItem) {
        if (args.target.componentType === 'editor') {
          this.focusedEditor = args.target.component as CodeEditorComponent;
          this.focusedEditor.monacoEditor?.focus();
        }
      }
    });
    this.glHost.goldenLayout.loadLayout(DEFAULT_LAYOUT_CONFIG);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(CodeEditorActions.Clear());
    // this.store.dispatch(StreamlitActions.StopScript({ name: this.project.name }));
    this.store.dispatch(CodeEditorActions.DisconnectFromEditWebsocket());
  }

  async onNewFile() {
    if (this.openDialog) return;
    this.openDialog = this.dialog.open<InputDialogComponent, InputDialogData, string>(InputDialogComponent, {
      data: {
        title: 'File name with path',
        inputLabel: 'File',
        submitButton: 'Create',
        hint: 'dir/file.py',
        inputPrefix: '/'
      }
    });
    const result = await this.openDialog.afterClosed().pipe(take(1)).toPromise();
    this.openDialog = null;
    if (result)
      this.store.dispatch(CodeEditorActions.SendEditMessage({
        msg: {
          action: 'create',
          file_path: result,
          base64encoded: false,
          content: '',
          previous_path: ''
        }
      }));
  }

  async onFileUpload(files: FileList) {

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      this.store.dispatch(CodeEditorActions.SendEditMessage({
        msg: {
          action: 'create',
          file_path: file.name,
          base64encoded: true,
          content: await fileToBase64(file),
          previous_path: ''
        }
      }));
    }
  }

  async commitChanges() {
    if (this.openDialog) return;
    this.openDialog = this.dialog.open(CommitDialogComponent, {
      width: '350px',
      minHeight: '100px'
    });
    const result = await this.openDialog.afterClosed().pipe(take(1)).toPromise();

    if (result) {
      this.store.dispatch(CodeEditorActions.CommitChanges({repo:this.repo.git_service_id, commitMsg: result }));
      this.store.dispatch(RepositoryActions.GetRepository({id:this.repo.git_service_id}));
    }
    this.openDialog = null;
  }

  runFile(filePath: string) {

    if (!filePath) {
      return;
    }

    this.snackBar.open("Starting script...", "", {
      duration: 1500,
      verticalPosition: 'top'
    })
    this.store.dispatch(CodeEditorActions.SendControlMessage({
      msg:{
        file:filePath,
        action:'run',
        env:{
          "DCM":this.selectedDcm
        }
      }
    }));
  }

  @HostListener('window:beforeunload', ['$event'])
  async canLeave(event: BeforeUnloadEvent) {
    if (await this.unsavedChanges$.pipe(take(1)).toPromise())
      return event.returnValue = 'Are you sure you want to leave this page? Changes may not be saved';
  }

  async menuAction(el: MenuItem) {
    if (!('id' in el)) return;

    switch (el.id) {
      case 'NEW_FILE':
        this.onNewFile();
        break;
      case 'UPLOAD_FILE':
        pickFile(this.onFileUpload.bind(this));
        break;
      case 'SAVE_FILES':
        this.editors.forEach((editor) => editor[0]?.saveCode());
        break;
      case 'SHOW_TOP_BAR':
        this.fullScreen = !this.fullScreen;
        break;
      case 'SHOW_TOOL_BAR':
        this.showToolBar = !this.showToolBar;
        break;
      case 'RUN':
        if (this.focusedTab) {
          this.runFile(this.focusedTab.path);
          break;
        }

        if (!this.lastChosenFile || !fileListFlatten(this.projectFiles).find((v) => v === this.lastChosenFile) ) {
          this.lastChosenFile = await this.pickFileForRunning();
        }

        this.runFile(this.lastChosenFile);
        break;
      case 'RUN_FILE':
        this.runFile(await this.pickFileForRunning());
        break;
      case 'COMMIT':
        this.commitChanges();
        break;
      case 'SHOW_FILE_TREE':
        this.showFileTree = !this.showFileTree;
        this.updateFileTreePanel();
        break;
      case 'FIND':
        this.focusedEditor?.monacoEditor?.trigger('', 'actions.find', null);
        break;
      case 'REPLACE':
        this.focusedEditor?.monacoEditor?.trigger('', 'editor.action.startFindReplaceAction', null)
        break;
      case 'UNDO':
        this.focusedEditor?.monacoEditor?.trigger('', 'undo', null);
        break;
      case 'REDO':
        this.focusedEditor?.monacoEditor?.trigger('', 'redo', null);
        break;
      case 'STOP':
        this.store.dispatch(CodeEditorActions.SendControlMessage({
          msg:{
            action:'stop',
            file:null,
            type:null
          }
        }));
        break;
      case 'SHOW_TERMINAL':
        this.showTerminal = !this.showTerminal;
        this.updateTerminalPanel();
        break;
    }
  }

  reconnectWebsocket() {
    this.store.dispatch(CodeEditorActions.ConnectToEditWebsocket({
      repo:this.repo.git_service_id,
      force:true
    }))
  }

  private updateFileTreePanel() {
    if (this.showFileTree) {
      Logger.logMessage('adding file tree');
      try {
        const row = this.glHost.goldenLayout.rootItem as RowOrColumn
        row.addItem({
          type: 'component',
          componentType: 'file-tree',
          title: `Files`,
          header: { popout: false },
          width:10
        },0);
      } catch (e) {
        Logger.logError(e);
      }
    } else {
      Logger.logMessage('closing file tree');
      this.fileTree?.close();
    }
  }

  private updateTerminalPanel() {
    if (this.showTerminal) {
      try {
        const column = this.glHost.goldenLayout.rootItem.contentItems[1].contentItems[0] as RowOrColumn;
        if (column) {
          column.addItem({
            type:'component',
            componentType:'terminal',
            title:'Terminal'
          })
        }
      }catch(e) {
        Logger.logError(e);
      }
    } else {
      this.terminal?.close();
    }
  }

  private addPreviewRunner() {
    if (!this.repo) return;
    try {
      const row = this.glHost.goldenLayout.rootItem.contentItems[1] as RowOrColumn;
      if(row)
        row.addItem({
          type: 'component',
          componentType: 'preview-runner',
          title: `Runner: ${this.repo.name}`,
          header: { popout: false },
          width:30,
          componentState: {
            id: this.repo.git_service_id
          }
        });
    else
      this.glHost.goldenLayout.addItemAtLocation({
        type: 'component',
        componentType: 'preview-runner',
        title: `Runner: ${this.repo.name}`,
        header: { popout: false },
        width:30,
        componentState: {
          id: this.repo.git_service_id
        }
      },createLayoutSelector(-1));
      Logger.logMessage(this.glHost.goldenLayout.saveLayout());
    } catch (e) {
      Logger.logError(e);
    }
  }

  private async pickFileForRunning() {
    if (this.openDialog) return;
    this.openDialog = this.dialog.open<PickerDialogComponent, PickerDialogData, string>(PickerDialogComponent, {
      panelClass: 'no-container-dialog',
      position: {
        top: '50px'
      },
      hasBackdrop: true,
      data: {
        options: fileListFlatten(this.projectFiles),
        placeholder: 'Pick a file'
      }
    });
    const result = await this.openDialog.afterClosed().pipe(take(1)).toPromise();
    this.openDialog = null;
    return result;
  }
}

function pickFile(onFilePicked: (file: FileList) => void): void {
  const inputElemenet = document.createElement('input');
  inputElemenet.style.display = 'none';
  inputElemenet.type = 'file';

  inputElemenet.addEventListener('change', () => {
    if (inputElemenet.files) {
      onFilePicked(inputElemenet.files);
    }
  });

  const teardown = () => {
    document.body.removeEventListener('focus', teardown, true);
    setTimeout(() => {
      document.body.removeChild(inputElemenet);
    }, 1000);
  }
  document.body.addEventListener('focus', teardown, true);

  document.body.appendChild(inputElemenet);
  inputElemenet.click();
}

function fileListFlatten(files: RepositoryFileEntry[]): string[] {
  if (!files)
    return []
  else {
    return [
      ...files.filter((f) => f.path.endsWith(".py")).map((f) => f.path),
      ...flatten<string>(
        files.map((f) => fileListFlatten(f.children))
      )
    ]
  }
}


function removeToolbarItem(items: ToolBarItem[],id: string) {
  const idx = items.findIndex((el) => el.id === id);
  if (idx === -1) return;
  items.splice(idx,1);
  return [...items]
}

function addToolbarItem(items: ToolBarItem[],item: ToolBarItem) {
  const has = items.findIndex((el) => el.id === item.id) !== -1;
  if (has) return;
  return [
    ...items,
    item
  ]
}