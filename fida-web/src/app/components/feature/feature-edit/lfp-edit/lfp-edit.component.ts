import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigService } from 'src/app/configs/config.service';
import { FeatureState, FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';
import { PureComService } from 'src/app/services/pureCom.service';
import { FidaTranslateService } from 'src/app/services/translate.service';
import { WorkAbbreviationService } from 'src/app/services/work-abbreviation.service';

@Component({
  selector: 'app-lfp-edit',
  templateUrl: './lfp-edit.component.html',
  styleUrls: ['./lfp-edit.component.scss']
})
export class LfpEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  public redefining = false;
  public materialisierungList: string[];

  constructor(
    private featureService: FeatureService,
    private configService: ConfigService,
    private pureComeService: PureComService,
    private fidaTranslateService: FidaTranslateService,
    private workAbbreviationService: WorkAbbreviationService
  ) { }

  async ngOnInit(): Promise<void> {
    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }

    // set feature language 
    if (!this.feature.language) {
      this.feature.language = await this.pureComeService.getLang(this.feature.geometry);
    }

    const materialisierungDomain = this.configService.getDomainByName('FIDA_MATERIALISIERUNG_CD');
    this.materialisierungList = this.fidaTranslateService.getTranslatedCodedValueNamesByLang(materialisierungDomain, this.feature.language);

    // for optimization force a load
    await this.workAbbreviationService.getWorkAbbreviationList(this.feature.language);
  }

  async redefineGrundbuchDataClick(): Promise<any> {
    this.redefining = true;
    await this.featureService.redefineGrundbuchFeatures(this.feature);
    this.redefining = false;
  }

  async addNachfuehrungClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.nachfuehrung);
  }

  getNachfuehrungFeatures(): FidaFeature[] {
    const featurelist = this.feature?.relatedFeatures?.nachfuehrung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
    if (featurelist) {
      featurelist.sort((a: FidaFeature, b: FidaFeature) => {
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

  async addRueckversicherungClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.rueckversicherung);
  }

  getRueckversicherungFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.rueckversicherung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  async addAnhangClick(): Promise<any> {
    await this.featureService.createRelatedFeature(this.feature, RelationshipName.anhang);
  }

  getAnhangFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.anhang?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }

  isActiveTab(tab: string): boolean {
    const activeTab = this.feature?.activeTab || 'lfp_general_tab';
    return activeTab === tab;
  }

  tabClick(tab: string): void {
    this.feature.activeTab = tab;
  }
}
