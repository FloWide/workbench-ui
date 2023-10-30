import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppState } from '@core/store';
import { CodeEditorActions } from '@core/store/code-editor/code-edior.action';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ComponentContainer } from 'golden-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponentContainerInjectionToken, GlComponentDirective } from 'src/app/golden-layout';
import { BaseTermComponent } from 'src/app/xterm/base-term.component';
import { Terminal } from 'xterm';
import { TerminalBufferService } from './terminal-buffer.service';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent extends GlComponentDirective implements OnDestroy{

  private terminal: Terminal = null;

  private destroy$ = new Subject();

  @ViewChild(BaseTermComponent,{static:true}) terminalComponent: BaseTermComponent;

  constructor(
    elementRef: ElementRef,
    private store: Store<AppState>,
    private actions$: Actions,
    private terminalBufferService: TerminalBufferService,
    @Inject(ComponentContainerInjectionToken) private container: ComponentContainer,
  ) {
    super(elementRef.nativeElement);
   }
  

  onReady(term: Terminal) {
    this.terminal = term;
    this.terminalBufferService.buffer.forEach((line) => {
      this.terminal.write(line);
    })
    this.terminal.onData((data) => {
      this.store.dispatch(CodeEditorActions.SendStreamMessage({msg:data}));
    });

    this.terminalBufferService.messages$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.terminal.write(data);
    });
    this.container.on('resize',() => {
      this.terminalComponent.onResize();
    })
  }

  close() {
    this.container.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
