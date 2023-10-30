import { Inject, InjectionToken, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MonacoCodeEditor } from './monaco-code-editor';
import { Themes, ThemeService } from '@material/theme.service';
import { setDiagnosticsOptions } from 'monaco-yaml';
import  * as monaco from 'monaco-editor';

export const MONACO_LOADED = new InjectionToken<BehaviorSubject<boolean>>('MONACO_LOADED');


let isMonacoLoaded: boolean = false;
let loadPromise: Promise<void>;


@NgModule({
  declarations: [
    MonacoCodeEditor
  ],
  imports: [
    CommonModule
  ],
  exports:[
    MonacoCodeEditor
  ],
  providers:[
    {
      provide:MONACO_LOADED,
      useFactory: () => new BehaviorSubject<boolean>(false)
    }
  ]
})
export class MonacoEditorModule {

  constructor(
    @Inject(MONACO_LOADED) private monacoLoaded$: BehaviorSubject<boolean>,
    private themeService: ThemeService
  ) {
    this.themeChanger();
    monacoLoaded$.next(true);
  }

  private themeChanger() {
    this.themeService.themeChange$.subscribe((theme) => {
      switch (theme) {
        case Themes.LIGHT:
          monaco.editor.setTheme('vs');
          break;
        case Themes.DARK:
          monaco.editor.setTheme('vs-dark');
          break;
      }
    })
  }

}
