import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'base-term',
  template:``,
  styles:[
    `
      :host {
        width:100%;
        height:100%;
        box-sizing:border-box;
        display:block;
      }
    `
  ]
})
export class BaseTermComponent implements OnInit,OnDestroy {


  @Output() ready = new EventEmitter<Terminal>();

  private terminal: Terminal = null;

  private fitAddon: FitAddon = null;

  constructor(
    private elementRef: ElementRef
  ) { }
  

  ngOnInit(): void {
    this.terminal = new Terminal();
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(this.elementRef.nativeElement);
    this.fitAddon.fit();
    this.ready.emit(this.terminal);
  }

  ngOnDestroy(): void {
    this.fitAddon.dispose();
    this.terminal.dispose();
  }

  @HostListener('resize')
  onResize() {
    this.fitAddon.fit();
  }

}
