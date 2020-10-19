import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config, LayerConfig, RelationshipConfig } from './models/config.model';

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

    public getLayerConfigs(): [LayerConfig] {
        return this.config.layers;
    }

    public getArcGisPortal(): string {
        return environment.arcGisPortal;
    }

    public getRelationshipConfigs(featureLayerId: string) : [RelationshipConfig] {
        const layerConfigs = this.config.layers.filter(c => c.properties.id === featureLayerId);
        if(layerConfigs.length !== 1){
            throw new Error("invalid relationships configuration");
        }
        return layerConfigs[0].relationships;
    }
}