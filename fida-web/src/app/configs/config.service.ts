import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    Config, ExtentConfig, GpConfig, LayerConfig, LayerType,
    RelationshipsConfig, VersionManagementConfig
} from '../models/config.model';
import { environment } from '../../environments/environment';
import esriRequest from 'esri/request';


@Injectable({ providedIn: 'root' })
export class ConfigService {
    private config: Config;

    constructor(private httpClient: HttpClient) {
    }

    public async load(): Promise<any> {
        this.config = await this.httpClient.get('assets/configs/config.json').toPromise() as Config;

        // update arcgis-server-placeholders
        this.config.layerBaseUrl = this.config.layerBaseUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
        this.config.versionManagement.serverUrl = this.config.versionManagement.serverUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
        this.config.gp.getParcelInfoUrl = this.config.gp.getParcelInfoUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);

        // load arcgis-server-config
        this.config.layerInfos = await this.loadArcGisServerConfig(this.config.layerBaseUrl + '/layers');

        // set url to layers
        this.config.layers.forEach(layerConfig => {
            const layerId = this.findLayerId(layerConfig.name);
            layerConfig.properties.url = `${this.config.layerBaseUrl}/${layerId}`;
        });
    }

    private findLayerId(layerName: string): number {
        const layerInfo = this.config.layerInfos.layers.find((f: any) => f.name === layerName);
        if (!layerInfo) {
            throw new Error(`on layer with name "${layerName}" found in esri-configuration`);
        }
        return layerInfo.id;
    }

    private findTableId(tableName: string): number {
        const layerInfo = this.config.layerInfos.tables.find((f: any) => f.name === tableName);
        if (!layerInfo) {
            throw new Error(`on table with name "${tableName}" found in esri-configuration`);
        }
        return layerInfo.id;
    }

    private loadArcGisServerConfig(url: string): Promise<any> {
        const options: __esri.RequestOptions = {
            query: { f: 'json' },
            responseType: 'json'
        };

        return new Promise((resolve, reject) => {
            esriRequest(url, options)
                .then((result) => resolve(result.data))
                .catch((error) => reject({ response: error }));
        });

    }

    public getArcGisPortal(): string {
        return environment.arcGisPortal;
    }

    public getArcGisServer(): string {
        return environment.arcGisServer;
    }

    public getLayerInfos(): any {
        return this.config.layerInfos;
    }

    /**
     *  get configs
     */

    public getLayerBaseUrl(): string {
        return this.config.layerBaseUrl;
    }

    public getDefaultVersionName(): string {
        return this.config.defaultVersion;
    }

    public getTranslateTableUrl(): string {
        const tableId = this.findTableId(this.config.translateTableName);
        return `${this.config.layerBaseUrl}/${tableId}`;
    }

    public getLanguages(): string[] {
        return this.config.languages;
    }

    public getGpConfig(): GpConfig {
        return this.config.gp;
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
