import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config, LayerConfig, LayerType, RelationshipConfig } from '../models/config.model';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ConfigService {
    private config: Config;

    constructor(private httpClient: HttpClient) {
    }

    public load(): Promise<any> {
        return this.httpClient.get('/assets/configs/config.json')
            .toPromise()
            .then((config: Config) => {
                this.config = config;

                // replace arcgis-url placeholder with environment value
                this.config.layers.forEach(layerConfig => {
                    if (layerConfig.properties.url) {
                        layerConfig.properties.url = layerConfig.properties.url
                            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
                    }
                });
            });
    }

    public getLayerConfigs(): LayerConfig[] {
        return this.config.layers.filter(f => f.type === LayerType.FeatureLayer);
    }

    public getArcGisPortal(): string {
        return environment.arcGisPortal;
    }

    public getRelationshipConfigs(featureLayerId: string): RelationshipConfig[] {
        const layerConfigs = this.config.layers.filter(c => c.properties.id === featureLayerId);
        if (layerConfigs.length !== 1) {
            throw new Error(`on layer with id "${featureLayerId}" found in configuration`);
        }
        return layerConfigs[0].relationships ?? [];
    }

    public getQueryLayerConfig(id: string): LayerConfig {
        const queryLayerConfigs = this.config.layers.filter(f => f.type === LayerType.QueryLayer && f.properties.id === id);
        if (queryLayerConfigs.length !== 1) {
          throw new Error('invalid query-layer configuration');
        }
        return queryLayerConfigs[0];
      }
}