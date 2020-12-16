import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-schweremessung-edit',
  templateUrl: './schweremessung-edit.component.html',
  styleUrls: ['./schweremessung-edit.component.scss']
})
export class SchweremessungEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `schweremessung_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    const date = UtilService.esriToDate(this.feature.attributes.DATUM);
    return UtilService.formatDate(date, 'yyyy-mm-dd') || '-no date-';
  }
}
