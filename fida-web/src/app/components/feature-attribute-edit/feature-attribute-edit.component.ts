import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-feature-attribute-edit',
  templateUrl: './feature-attribute-edit.component.html',
  styleUrls: ['./feature-attribute-edit.component.scss']
})
export class FeatureAttributeEditComponent implements OnInit {
  @Input() name: string;
  @Input() attributes: any;
  @Input() displayName: string;
  
  constructor() { }

  ngOnInit(): void {
  }
}
