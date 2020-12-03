import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model'; 
import { FORMAT_UTILS, CONVERT_UTILS } from '../../../../utils/utils';

@Component({
  selector: 'app-schaeden-edit',
  templateUrl: './schaeden-edit.component.html',
  styleUrls: ['./schaeden-edit.component.scss']
})
export class SchaedenEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `schweremessung_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    const date = CONVERT_UTILS.esriToDate(this.feature.attributes.DATUM);
    return FORMAT_UTILS.formatDate(date, 'yyyy-mm-dd') || '-no date-';
  }
}
