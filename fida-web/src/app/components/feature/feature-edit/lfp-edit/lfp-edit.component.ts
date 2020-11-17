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

  constructor(
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {  
    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
   }    
  }

  async addNachfuehrungClick() {
    await this.featureService.createRelatedFeature(this.feature, 'nachfuehrung');
  }

  getNachfuehrungFeatures() {
    return this.feature?.relatedFeatures?.nachfuehrung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
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
}
