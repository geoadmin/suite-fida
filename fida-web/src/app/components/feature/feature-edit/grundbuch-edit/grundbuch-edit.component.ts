import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-grundbuch-edit',
  templateUrl: './grundbuch-edit.component.html',
  styleUrls: ['./grundbuch-edit.component.scss']
})
export class GrundbuchEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `grundbuch_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    return `${this.feature.attributes.GEMEINDE} - ${this.feature.attributes.PARZ}`;
  }
}
