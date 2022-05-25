import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @Input() data: any;
  @Input() route: any;

  constructor() { }

  ngOnInit(): void {
  }

}
