import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-hfp-edit',
  templateUrl: './hfp-edit.component.html',
  styleUrls: ['./hfp-edit.component.scss']
})
export class HfpEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  public redefining = false;

  constructor(
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  async redefineGrundbuchDataClick(): Promise<void> {
    this.redefining = true;
    await this.featureService.redefineGrundbuchFeatures(this.feature);
    this.redefining = false;
  }

  async addNachfuehrungClick(): Promise<void> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.nachfuehrung);
  }

  getNachfuehrungFeatures(): FidaFeature[] {
    const featurelist = this.feature?.relatedFeatures?.nachfuehrung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
    if (featurelist) {
      featurelist.sort((a, b) => {
        const ad = a.attributes.NACHFUEHRUNGSDATUM || 0;
        const bd = b.attributes.NACHFUEHRUNGSDATUM || 0;
        return ad - bd;
      });
    }
    return featurelist;
  }

  async addGrundbuchClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.grundbuch);
  }

  getGrundbuchFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.grundbuch?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addSchaedenClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.schaeden);
  }

  getSchaedenFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.schaeden?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addAuslandpunktClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.auslandpunkt);
  }

  getAuslandpunktFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.auslandpunkt?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addSchweremessungClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.schweremessung);
  }

  getSchweremessungFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.schweremessung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addKontaktClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.kontakt);
  }

  getKontaktFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.kontakt?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addAnhangClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.anhang);
  }

  getAnhangFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.anhang?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }
}
