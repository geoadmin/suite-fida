import { Injectable } from '@angular/core';
import Feature from 'esri/Graphic';
import Locator from 'esri/tasks/Locator';
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
      this.translateSource(searchSource);
      searchSources.push(searchSource);
    });

    // TODO reload on gdbVersion change

    return searchSources;
  }


  private translateSource(source: SearchSource): void {
    const sourceAny: any = source;
    sourceAny.name = this.translateService.translate(sourceAny.name);
    source.placeholder = this.translateService.translate(source.placeholder);
  }

  private searchSourceFactory(searchSourceConfig: SearchSourceConfig): SearchSource {
    const properties = searchSourceConfig.properties;

    // locator
    if (searchSourceConfig.type === SearchType.Locator) {
      const locatorSource = new LocatorSearchSource(properties);
      locatorSource.locator = new Locator({ url: properties.url });
      return locatorSource;
    }

    // layer search
    /*if (searchSourceConfig.type === SearchType.Layer) {
      const featureLayerSource = new LayerSearchSource(properties);
      const featureLayer = this.layerService.getFeatureLayer(searchSourceConfig.idLayer);
      featureLayerSource.layer =  featureLayer;
      featureLayerSource.popupTemplate = featureLayer.popupTemplate;
      return featureLayerSource;
    }*/

    // special search
    if (searchSourceConfig.type === SearchType.Fida) {
      const featureLayer = this.layerService.getFeatureLayer(searchSourceConfig.idLayer);
      const searchSource = new SearchSource(properties);
      searchSource.getSuggestions = (params) => {
        const where = (properties.where as string).replace('???', params.suggestTerm);
        return this.queryService.where(featureLayer, where, properties.outFields, properties.maxResults).then((features) => {
          return features.map(m => {
            let text = '';
            (properties.displayField as string).split(',').map(s => text += m.attributes[s.trim()]);
            return {
              key: m.attributes.OBJECTID,
              text: `${text}`,
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
