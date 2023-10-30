import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  version = environment.version;
  buildTime = environment.buildTime;

  constructor() {
  }

  ngOnInit(): void {
  }

}
