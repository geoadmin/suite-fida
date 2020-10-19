import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config, LayerConfig } from './models/config.model';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ConfigService {
    private config: Config;

    constructor(private httpClient: HttpClient) {
    }

    public load(): Promise<any> {
        // return this.httpClient.get('/assets/configs/config.json')
        return this.httpClient.get('/assets/configs/config.local.json')
            .toPromise()
            .then((config: Config) => {
                this.config = config;

                // replace arcgis-url placeholder with environment value
                this.config.layers.forEach(layerConfig => {
                    if (layerConfig.properties.url) {
                        layerConfig.properties.url = layerConfig.properties.url
                            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisUrl);
                    }
                });
            });
    }

    public getLayerConfigs(): [LayerConfig] {
        return this.config.layers;
    }

    public getArcGisUrl(): string {
        return environment.arcGisUrl;
    }
}