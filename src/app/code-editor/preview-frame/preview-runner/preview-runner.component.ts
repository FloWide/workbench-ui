import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ScriptModel } from '@core/services';
import { AppState, Select} from '@core/store';
import { RunnerState } from '@core/store/code-editor/code-editor.state';
import { ScriptActions } from '@core/store/script/script.action';
import { Store } from '@ngrx/store';
import { ComponentContainer } from 'golden-layout';
import { Subject, Subscription } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { ComponentContainerInjectionToken, GlComponentDirective } from 'src/app/golden-layout';
import { PreviewHandlerService } from '../preview-handler.service';

@Component({
  selector: 'app-preview-runner',
  templateUrl: './preview-runner.component.html',
  styleUrls: ['./preview-runner.component.scss']
})
export class PreviewRunnerComponent extends GlComponentDirective implements OnInit,OnDestroy {


  @Input() id: number;

  frameRefresh:boolean = true;
  
  runnerState:RunnerState = null;

  private destroy$ = new Subject();

  private scriptInformationSubscription: Subscription;

  constructor(
    private store:Store<AppState>,
    elemenRef:ElementRef,
    public previewHandler: PreviewHandlerService,
    @Inject(ComponentContainerInjectionToken) private container: ComponentContainer,
    private cd: ChangeDetectorRef
    ) {
      super(elemenRef.nativeElement);
   }
  ngOnInit(): void {
    // this.store.dispatch(StreamlitActions.FetchProject({name:this.projectName}));
      if (this.scriptInformationSubscription) {
        this.scriptInformationSubscription.unsubscribe();
      }

      this.scriptInformationSubscription = this.store.select(Select.runnerState).pipe(
        takeUntil(this.destroy$),
      ).subscribe((state) => {
        if (state?.status != this.runnerState?.status && state?.status === 'active'){
          this.refresh();
        }

        if(state?.type !== 'streamlit')
          this.container.close();

        this.runnerState = state;
        this.cd.detectChanges();
      })
    this.container.on('destroy',() => {
      this.runnerState = null;
      this.frameRefresh = true;
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.frameRefresh = true;

    setTimeout(() => {
        this.frameRefresh = false;
    }, 50);
  }

  popout() {
    this.container.close();
    this.previewHandler.openPoputWindow();
  }
}
