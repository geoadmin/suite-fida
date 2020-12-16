import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-auslandpunkt-edit',
  templateUrl: './auslandpunkt-edit.component.html',
  styleUrls: ['./auslandpunkt-edit.component.scss']
})
export class AuslandpunktEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `auslandpunkt_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    return this.feature.attributes.PUNKTNAME;
  }
}
