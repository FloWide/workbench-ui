import { Inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeEditorComponent, EditorOptions, MonacoEditorGlobalConfig } from './code-editor/code-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@material/index';
import { FileTreeComponent } from './file-tree/file-tree.component';
import { CodeEditorPageComponent } from './code-editor-page/code-editor-page.component';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from '@components/components.module';
import { CommitDialogComponent } from './commit-dialog/commit-dialog.component';
import { BrowserFrameComponent } from './preview-frame/browser-frame/browser-frame.component';
import { PreviewRunnerComponent } from './preview-frame/preview-runner/preview-runner.component';
import { UtilsModule } from '../utils/utils.module';
import { CanCodeEditorPageDeactivate } from './code-editor-page/deactivate.guard';
import { GoldenLayoutModule } from '../golden-layout';
import { BehaviorSubject } from 'rxjs';
import { PreviewHandlerService } from './preview-frame/preview-handler.service';
import { MonacoEditorModule, MONACO_LOADED } from '../monaco-editor/monaco-editor.module';
import { Logger } from '../utils/logger';
import { filter, take } from 'rxjs/operators';
import { TerminalComponent } from './terminal/terminal.component';
import { XtermModule } from '../xterm/xterm.module';
import * as monaco from 'monaco-editor';
const routes:Routes = [
  {
    path:'',
    component:CodeEditorPageComponent,
    canDeactivate:[CanCodeEditorPageDeactivate]
  }
]



@NgModule({
  declarations: [CodeEditorComponent, FileTreeComponent, CodeEditorPageComponent, CommitDialogComponent, BrowserFrameComponent, PreviewRunnerComponent,TerminalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    UtilsModule,
    GoldenLayoutModule,
    MonacoEditorModule,
    XtermModule
  ],
  providers:[
    CanCodeEditorPageDeactivate,
    {
      provide:MonacoEditorGlobalConfig,
      useFactory:() => new BehaviorSubject<EditorOptions>({})
    },
    PreviewHandlerService
  ]
})
export class EditorModule {
  constructor(
    @Inject(MONACO_LOADED) private monacoLoaded$: BehaviorSubject<boolean>
    ) {
    this.monacoLoaded$.pipe(
      filter<Boolean>(Boolean),
      take(1)
    ).subscribe((value) => {
      Logger.logMessage('monaco loaded')
      strapExtraLibs();
    })
  }
 }


declare var require: any; // :(

const extraModules = ['hooks.d.ts','leaflet.d.ts','streamlit.d.ts','WebsocketClient.d.ts']

function strapExtraLibs() {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target:monaco.languages.typescript.ScriptTarget.ES2016,
    allowUmdGlobalAccess:true,
  });

  for(const file of extraModules) {
    const module = require(`!raw-loader!./editor-typings/${file}`)
    monaco.languages.typescript.typescriptDefaults.addExtraLib(module.default,`inmemory://model/${file}`); 
  }
}