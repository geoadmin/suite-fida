import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config, ExtentConfig, LayerConfig, LayerType, RelationshipsConfig, VersionManagementConfig } from '../models/config.model';
import { environment } from '../../environments/environment';
import esriRequest from 'esri/request';


@Injectable({ providedIn: 'root' })
export class ConfigService {
    private config: Config;

    constructor(private httpClient: HttpClient) {
    }

    public async load(): Promise<any> {
        this.config = await this.httpClient.get('assets/configs/config.json').toPromise() as Config;

        // replace arcgis-url placeholder with environment value
        this.config.layers.forEach(layerConfig => {
            if (layerConfig.properties.url) {
                layerConfig.properties.url = layerConfig.properties.url
                    .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
            }
        });

        this.config.versionManagement.serverUrl = this.config.versionManagement.serverUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);

        // TDOD load arcgis-server-config
        //const arcGisServerLayerInfosUrl = 'https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer/layers';
        //this.config.layerInfos = await this.loadArcGisServerConfig(arcGisServerLayerInfosUrl);        
    }

    private loadArcGisServerConfig(url: string): Promise<any> {
        const options: __esri.RequestOptions = {
            query: { f: 'json' },
            responseType: 'json'
        };

        return new Promise((resolve, reject) => {
            esriRequest(url, options)
                .then((result) => resolve(result))
                .catch((error) => reject({ response: error }));
        });

    }

    public getArcGisPortal(): string {
        return environment.arcGisPortal;
    }

    public getArcGisServer(): string {
        return environment.arcGisServer;
    }    

    /**
     *  get configs
     **/
    public getDefaultVersionName(): string {
        return this.config.defaultVersion;
    }

    public getDefaultExtentConfig(): ExtentConfig {
        return this.config.defaultExtent;
    }

    public getVersionManagementConfig(): VersionManagementConfig {
        return this.config.versionManagement;
    }
    
    public getRelationshipsConfigs(featureLayerId: string): RelationshipsConfig {
        const layerConfigs = this.config.layers.filter(c => c.properties.id === featureLayerId);
        if (layerConfigs.length !== 1) {
            throw new Error(`on layer with id "${featureLayerId}" found in configuration`);
        }
        return layerConfigs[0].relationships ?? {} as RelationshipsConfig;
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