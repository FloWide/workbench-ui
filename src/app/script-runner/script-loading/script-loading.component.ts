import { Component, Input, OnInit } from '@angular/core';
import { ScriptState } from '@core/services';

@Component({
  selector: 'script-loading',
  templateUrl: './script-loading.component.html',
  styleUrls: ['./script-loading.component.scss']
})
export class ScriptLoadingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
