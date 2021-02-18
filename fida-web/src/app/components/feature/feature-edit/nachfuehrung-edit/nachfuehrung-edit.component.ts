import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';
import { WorkAbbreviationService } from 'src/app/services/work-abbreviation.service';

@Component({
  selector: 'app-nachfuehrung-edit',
  templateUrl: './nachfuehrung-edit.component.html',
  styleUrls: ['./nachfuehrung-edit.component.scss']
})
export class NachfuehrungEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  @Input() language: string;
  public componentId: string;
  public workAbbreviationList: string[];

  constructor(private workAbbreviationService: WorkAbbreviationService) { }

  async ngOnInit(): Promise<void> {
    this.componentId = `nachfuehrung_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }

    this.workAbbreviationList = await this.workAbbreviationService.getWorkAbbreviationList(this.language);
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    return UtilService.getFeatureHeader(this.feature, RelationshipName.nachfuehrung);
  }
}
