import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Directive({
  selector: '[spinOn]'
})
export class SpinnerDirective implements OnInit {

  private shouldShow = false;

  spinner: ComponentRef<MatProgressSpinner>;
  componentFactory: ComponentFactory<MatProgressSpinner>;


  @HostBinding('class.spin-on-container') isSpinnerExist = false;

  @Input('spinOn') 
  set spinOn(value: boolean) {
    if (this.componentFactory) {
      if (value) {
        this.show();
      } else {
        this.hide();
      }
    } else {
      this.shouldShow = value;
    }
  }

  

  constructor(
    private view: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private renderer:Renderer2,
    private element:ElementRef) { }

  ngOnInit(): void {
    this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(MatProgressSpinner);
    if(this.shouldShow)
      this.show();
  }

  show() {
    if(!this.isSpinnerExist) {
      this.spinner = this.view.createComponent(this.componentFactory);
      this.spinner.location.nativeElement.style.position = 'absolute';
      this.spinner.location.nativeElement.style.top = 'calc(50% - 50px)';
      this.spinner.location.nativeElement.style.left = 'calc(50% - 50px)';
      this.spinner.instance.color = 'warn';
      this.renderer.appendChild(this.element.nativeElement,this.spinner.location.nativeElement);
      this.isSpinnerExist = true;
    }
  }

  hide() {
    if(this.isSpinnerExist) {
      this.view.remove();
      this.isSpinnerExist = false;
    }
  }

}
