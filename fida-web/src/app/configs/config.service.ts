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

    public getArcGisPortal(): string {
        return environment.arcGisPortal;
    }

    /**
     *  get configs
     **/

    public getRelationshipConfigs(featureLayerId: string): RelationshipConfig[] {
        const layerConfigs = this.config.layers.filter(c => c.properties.id === featureLayerId);
        if (layerConfigs.length !== 1) {
            throw new Error(`on layer with id "${featureLayerId}" found in configuration`);
        }
        return layerConfigs[0].relationships ?? [];
    }

    public getLayerConfigs(): LayerConfig[] {
        return this.config.layers.filter(f => f.type === LayerType.FeatureLayer);
    }

    public getLayerConfigById(id: string): LayerConfig {
        const layerConfigs = this.config.layers.filter(f => f.properties.id === id);
        if (layerConfigs.length !== 1) {
            throw new Error(`invalid configuration for id "${id}"`);
        }
        return layerConfigs[0];
    }

    public getLayerConfigByUrl(url: string): LayerConfig {
        const layerConfigs = this.config.layers.filter(f => f.properties.url === url);
        if (layerConfigs.length !== 1) {
            throw new Error(`invalid configuration for url "${url}"`);
        }
        return layerConfigs[0];
    }

    public getLayerConfig(type: LayerType, id: string): LayerConfig {
        const layerConfigs = this.config.layers.filter(f => f.type === type && f.properties.id === id);
        if (layerConfigs.length !== 1) {
            throw new Error(`invalid configuration for layer-type "${type}" and id "${id}"`);
        }
        return layerConfigs[0];
    }
}