import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-lfp-edit',
  templateUrl: './lfp-edit.component.html',
  styleUrls: ['./lfp-edit.component.scss']
})
export class LfpEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean = false;
  public redefining: boolean = false;

  constructor(
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  async redefineGrundbuchDataClick(): Promise<any> {
    this.redefining = true;
    await this.featureService.redefineGrundbuchFeatures(this.feature);
    this.redefining = false;
  }

  async addNachfuehrungClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.Nachfuehrung);
  }

  getNachfuehrungFeatures(): FidaFeature[] {
    let featurelist = this.feature?.relatedFeatures?.nachfuehrung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
    if (featurelist) {
      featurelist.sort(function (a, b) {
        const ad = a.attributes.NACHFUEHRUNGSDATUM || 0;
        const bd = a.attributes.NACHFUEHRUNGSDATUM || 0;
        return ad - bd;
      });
    }
    return featurelist;
  }

  async addGrundbuchClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.Grundbuch);
  }

  getGrundbuchFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.grundbuch?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addRueckversicherungClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.Rueckversicherung);
  }

  getRueckversicherungFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.rueckversicherung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addAnhangClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.Anhang);
  }

  getAnhangFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.anhang?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }
}
