import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
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

  async redefineGrundbuchDataClick() {
    this.redefining = true;
    await this.featureService.redefineGrundbuchFeatures(this.feature);
    this.redefining = false;
  }

  async addNachfuehrungClick() {
    await this.featureService.createRelatedFeature(this.feature, 'nachfuehrung');
  }

  getNachfuehrungFeatures() {
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

  async addGrundbuchClick() {
    await this.featureService.createRelatedFeature(this.feature, 'grundbuch');
  }

  getGrundbuchFeatures() {
    return this.feature?.relatedFeatures?.grundbuch?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addRueckversicherungClick() {
    await this.featureService.createRelatedFeature(this.feature, 'rueckversicherung');
  }

  getRueckversicherungFeatures() {
    return this.feature?.relatedFeatures?.rueckversicherung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addKontaktClick() {
    await this.featureService.createRelatedFeature(this.feature, 'kontakt');
  }

  getKontaktFeatures() {
    return this.feature?.relatedFeatures?.kontakt?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addAnhangClick() {
    await this.featureService.createRelatedFeature(this.feature, 'anhang');
  }

  getAnhangFeatures() {
    return this.feature?.relatedFeatures?.anhang?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  lv95Change(): void {
    //this.featureService.updateGeometryFromLV95Attributes(this.feature);
  }
}
