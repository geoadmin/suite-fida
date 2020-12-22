import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-nachfuehrung-edit',
  templateUrl: './nachfuehrung-edit.component.html',
  styleUrls: ['./nachfuehrung-edit.component.scss']
})
export class NachfuehrungEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `nachfuehrung_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    return UtilService.getFeatureHeader(this.feature, RelationshipName.nachfuehrung);
  }
}
