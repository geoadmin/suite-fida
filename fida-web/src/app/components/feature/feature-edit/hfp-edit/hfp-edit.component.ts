import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-hfp-edit',
  templateUrl: './hfp-edit.component.html',
  styleUrls: ['./hfp-edit.component.scss']
})
export class HfpEditComponent implements OnInit {
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

  async addGrundbuchClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, 'grundbuch');
  }

  getGrundbuchFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.grundbuch?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addSchaedenClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, 'schaeden');
  }

  getSchaedenFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.schaeden?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addAuslandpunktClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, 'auslandpunkt');
  }

  getAuslandpunktFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.auslandpunkt?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addSchweremessungClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, 'schweremessung');
  }

  getSchweremessungFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.schweremessung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addKontaktClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, 'kontakt');
  }

  getKontaktFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.kontakt?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addAnhangClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, 'anhang');
  }

  getAnhangFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.anhang?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }
}
