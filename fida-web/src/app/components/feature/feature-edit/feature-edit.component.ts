import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Feature from 'esri/Graphic';

@Component({
  selector: 'app-feature-edit',
  templateUrl: './feature-edit.component.html',
  styleUrls: ['./feature-edit.component.scss']
})
export class FeatureEditComponent implements OnInit {
  @Input() feature: Feature;
  @Output() save = new EventEmitter<Feature>();
  @Output() cancel = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  saveClick(): void { 
    this.save.emit(this.feature);
  }

  cancelClick(): void { 
    this.cancel.emit();
  }

}
