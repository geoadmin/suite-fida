import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-rueckversicherung-edit',
  templateUrl: './rueckversicherung-edit.component.html',
  styleUrls: ['./rueckversicherung-edit.component.scss']
})
export class RueckversicherungEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `rueckversicherung_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    return this.feature.attributes.PUNKTBEZEICHNUNG || '- no name -';
  }
}
