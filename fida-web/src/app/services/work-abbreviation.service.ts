import { Inject, Injectable } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ConfigService } from '../configs/config.service';
import { FidaFeature } from '../models/FidaFeature.model';
import { MessageService } from './message.service';
import { QueryService } from './query.service';
import { FidaTranslateService } from './translate.service';

@Injectable({
  providedIn: 'root'
})
export class WorkAbbreviationService {
  private workAbbreviationLists: any;
  public searchLoading: boolean;
  public searchNoResults: boolean;
  public selectedSearchItem: any;

  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(QueryService) private queryService: QueryService,
    @Inject(MessageService) private messageService: MessageService,
    @Inject(FidaTranslateService) private fidaTranslateService: FidaTranslateService
  ) { }

  public async getWorkAbbreviationList(language: string): Promise<string[]> {
    // check of lists
    if (!this.workAbbreviationLists) {
      try {
        const url = this.configService.getWorkAbbreviationTableUrl();
        const workAbbreviationFeatures = await this.queryService.url(url);
        this.workAbbreviationLists = this.convertFeatureToLists(workAbbreviationFeatures);
        return this.workAbbreviationLists[language];
      } catch (error) {
        this.messageService.error('Work-Abbreviation-Call failed', error);
      }
    }

    const workAbbreviationList = this.workAbbreviationLists[language];
    if (workAbbreviationList) {
      return Promise.resolve(workAbbreviationList);
    }
  }

  private convertFeatureToLists(features: FidaFeature[]): any {
    const lists: any = {};
    if (features.length > 0) {
      this.configService.getLanguages().forEach(language => {
        lists[language] = [] as string[];
        const keys = features.map(m => `domain.fida_arbeitskuerzellfp_cd.${m.attributes.CODE}`);
        lists[language] = this.fidaTranslateService.translateList(keys, language);
      });
    }
    return lists;
  }

  public async queryWorkAbbreviations(featureLayer: FeatureLayer, searchText: string): Promise<any> {

    const search = searchText.toLocaleLowerCase();
    const where = `LOWER(ARBEITSKUERZELTEXT) like '%${search}%'`;

    return this.queryService.where(featureLayer, where).then(features => {
      return features.map(feature => {
        return {
          feature,
          name: feature.attributes.ARBEITSKUERZELTEXT
        };
      });
    });
  }

  public onSearchLoading(e: boolean): void {
    this.searchLoading = e;
    if (this.searchLoading) {
      this.selectedSearchItem = undefined;
    }
  }

  public onSearchNoResults(e: boolean): void {
    this.searchNoResults = e;
  }

  public onSearchSelect(e: TypeaheadMatch): void {
    this.selectedSearchItem = e.item;
  }
}
