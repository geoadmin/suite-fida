import { Injectable } from '@angular/core';
import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Locator from 'esri/tasks/Locator';
import LayerSearchSource from 'esri/widgets/Search/LayerSearchSource';
import LocatorSearchSource from 'esri/widgets/Search/LocatorSearchSource';
import SearchSource from 'esri/widgets/Search/SearchSource';
import { ConfigService } from '../configs/config.service';
import { SearchSourceConfig, SearchType } from '../models/config.model';
import { QueryService } from './query.service';
import { FidaTranslateService } from './translate.service';
import { LayerService } from './layer.service';

@Injectable({
  providedIn: 'root'
})
export class SearchSourceService {

  constructor(
    private translateService: FidaTranslateService,
    private configService: ConfigService,
    private queryService: QueryService,
    private layerService: LayerService
  ) { }


  getSearchSource(): SearchSource[] {
    const searchSources: SearchSource[] = [];

    const searchConfig = this.configService.getSearchConfig();
    searchConfig.forEach(searchSourceConfig => {
      const searchSource = this.searchSourceFactory(searchSourceConfig);
      //this.translateSource(searchSource);
      searchSources.push(searchSource);
    });

    // TODO reload on gdbVersion change

    return searchSources;
  }


  /* private translateSource(source: __esri.FeatureLayerSource | __esri.LocatorSource): void {
     this._translate.get([source.name, source.placeholder]).subscribe(
       translates => {
         source.name = translates[source.name];
         source.placeholder = translates[source.placeholder];
       });
   }*/

  private searchSourceFactory(searchSourceConfig: SearchSourceConfig): SearchSource {
    const properties = searchSourceConfig.properties;

    // locator
    if (searchSourceConfig.type === SearchType.Locator) {
      const locatorSource = new LocatorSearchSource(properties);
      locatorSource.locator = new Locator({ url: properties.url });
      return locatorSource;
    }

    // layer search
    if (searchSourceConfig.type === SearchType.Layer) {
      const featureLayerSource = new LayerSearchSource(properties);
      featureLayerSource.layer = new FeatureLayer({ url: searchSourceConfig.url });
      //featureLayerSource.popupTemplate = this.templateService.getFeatureTemplate();
      return featureLayerSource;
    }

    // special search
    if (searchSourceConfig.type === SearchType.Fida) {
      const featureLayer = this.layerService.getFeatureLayer(searchSourceConfig.idLayer);
      const searchSource = new SearchSource(properties);
      searchSource.getSuggestions = (params) => {
        const where = `${properties.where} like '%${params.suggestTerm}%'`;
        return this.queryService.where(featureLayer, where, properties.outFields, properties.maxResults).then((features) => {
          return features.map(m => {
            return {
              key: m.attributes.OBJECTID,
              text: `${m.attributes.LFPNR}`,
              sourceIndex: params.sourceIndex
            };
          });
        });
      };

      searchSource.getResults = (params) => {
        const objectid = params.suggestResult.key;
        if (objectid != null) {
          return this.queryService.feature(featureLayer, objectid).then(fidaFeature => {
            return [{
              extent: undefined,
              feature: fidaFeature as Feature,
              name: '',
              target: fidaFeature as Feature
            }];
          });
        }
      };

      searchSource.popupTemplate = featureLayer.popupTemplate;
      //searchSource.popupEnabled = false;
      return searchSource;
    }

  }
}
