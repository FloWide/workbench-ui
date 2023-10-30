import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';




export interface ToolBarItem {
  title:string;
  id:string;
  align: 'start' | 'center' | 'end'
  display: {
    icon:string;
    color?:string;
    big?:boolean;
  }
}


@Component({
  selector: 'tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent implements OnInit {


  @Input() toolBarItems: ToolBarItem[] = [];

  @Output() buttonClicked = new EventEmitter<ToolBarItem>();

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }
}
