import { Directive } from '@angular/core';

@Directive()
export abstract class GlComponentDirective {

  constructor(private rootElement: HTMLElement) {
    this.rootElement.style.position = 'absolute';
    this.rootElement.style.overflow = 'hidden';
   }

  setPositionAndSize(left: number, top: number, width: number, height: number) {
      this.rootElement.style.left = this.numberToPixels(left);
      this.rootElement.style.top = this.numberToPixels(top);
      this.rootElement.style.width = this.numberToPixels(width);
      this.rootElement.style.height = this.numberToPixels(height);
  } 

  setVisibility(visible: boolean) {
      if (visible) {
          this.rootElement.style.display = '';
      } else {
          this.rootElement.style.display = 'none';
      }
  }

  setZIndex(value: string) {
      this.rootElement.style.zIndex = value;
  }

  private numberToPixels(value: number): string {
      return value.toString(10) + 'px';
  }

}