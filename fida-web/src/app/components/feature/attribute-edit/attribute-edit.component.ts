import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-attribute-edit',
  templateUrl: './attribute-edit.component.html',
  styleUrls: ['./attribute-edit.component.scss']
})
export class AttributeEditComponent implements OnInit {
  @Input() name: string;
  @Input() attributes: any;
  @Input() displayName: string;
  
  constructor() { }

  ngOnInit(): void {
  }
}
