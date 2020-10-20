import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import Feature from 'esri/Graphic'

@Component({
  selector: 'app-feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss']
})
export class FeatureInfoComponent implements OnInit {
  @ViewChild('featureInfo', { static: true }) public featureInfoElement: ElementRef;
  @Input() feature: Feature;

  constructor() { }

  ngOnInit(): void {
  }

  edit(event: Event) { 
    console.log('edit'); 
  } 
}
