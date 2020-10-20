import { Component, Input, OnInit } from '@angular/core';
import Graphic from 'esri/Graphic';

@Component({
  selector: 'app-feature-view',
  templateUrl: './feature-view.component.html',
  styleUrls: ['./feature-view.component.scss']
})
export class FeatureViewComponent implements OnInit {
  @Input() feature: Graphic;

  constructor() { }

  ngOnInit(): void {
  }

}
