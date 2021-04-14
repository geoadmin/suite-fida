import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    Config, ExtentConfig, GpConfig, LayerConfig, LayerType,
    RelationshipsConfig, RolesConfig, SearchSourceConfig, SearchType, VersionManagementConfig
} from './config.model';
import { environment } from '../../environments/environment';
import esriRequest from '@arcgis/core/request';
import esriConfig from '@arcgis/core/config';
import CodedValueDomain from '@arcgis/core/layers/support/CodedValueDomain';
import { System } from 'src/environments/environment interface';


@Injectable({ providedIn: 'root' })
export class ConfigService {
    private config: Config;

    constructor(private httpClient: HttpClient) {
        esriConfig.request.interceptors.push({
            urls: /FeatureServer\/\d+$/,
            after: (response) => {
                response.data.supportedQueryFormats = 'JSON';
            }
        });
    }

    public async load(): Promise<any> {
        this.config = await this.httpClient.get('assets/configs/config.json').toPromise() as Config;

        // update arcgis-server-placeholders (TODO: dynamic over all objects)
        this.config.layerBaseUrl = this.config.layerBaseUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
        this.config.versionManagement.serverUrl = this.config.versionManagement.serverUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
        this.config.gp.getParcelInfoUrl = this.config.gp.getParcelInfoUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
        this.config.gp.pureComUrl = this.config.gp.pureComUrl
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);
        this.config.gp.exportToFile = this.config.gp.exportToFile
            .replace(this.config.arcGisUrlPlaceholder, environment.arcGisServer);

        // load arcgis-server-config
        this.config.layerInfos = await this.loadArcGisServerConfig(this.config.layerBaseUrl + '/layers');

        // set url to layers
        this.config.layers.forEach(layerConfig => {
            const layerId = this.findLayerId(layerConfig.name);
            layerConfig.properties.url = `${this.config.layerBaseUrl}/${layerId}`;
        });
    }

    private getLayersTables(): any[] {
        return this.config.layerInfos.layers.concat(this.config.layerInfos.tables);
    }

    private findLayerId(layerName: string): number {
        const layerInfo = this.getLayersTables().find((f: any) => f.name === layerName);
        if (!layerInfo) {
            throw new Error(`on layer with name "${layerName}" found in esri-configuration`);
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

    public getSystem(): System {
        return environment.system;
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

    public getLayerInfoById(layerId: number): any {
        return this.getLayersTables().find((f: any) => f.id === layerId);
    }

    public getLayerInfoByName(layerName: string): any {
        return this.getLayersTables().find((f: any) => f.name === layerName);
    }

    public getDomainByName(domainName: string): CodedValueDomain {
        for (const layer of this.getLayersTables()) {
            for (const field of layer.fields) {
                if (field.domain != null && field.domain.name === domainName) {
                    return CodedValueDomain.fromJSON(field.domain);
                }
            }
        }
        throw new Error(`on domain with name "${domainName}" found in esri-configuration`);
    }

    /**
     *  get configs
     */

    public getAppVersion(): string {
        return this.config.appVersion;
    }

    public getRolesConfig(): RolesConfig {
        return this.config.roles;
    }

    public getMaxGeometryDifference(): number {
        return this.config.maxGeometryDifference;
    }
    public getLayerBaseUrl(): string {
        return this.config.layerBaseUrl;
    }

    public getDefaultVersionName(): string {
        return this.config.defaultVersion;
    }

    public getTranslateTableUrl(): string {
        const tableId = this.findLayerId(this.config.translateTableName);
        return `${this.config.layerBaseUrl}/${tableId}`;
    }

    public getWorkAbbreviationTableUrl(): string {
        const tableId = this.findLayerId(this.config.workAbbreviationTableName);
        return `${this.config.layerBaseUrl}/${tableId}`;
    }

    public getLanguages(): string[] {
        return this.config.languages;
    }

    public getDatabaseFields(): string[] {
        return this.config.databaseFields;
    }

    public getGeometryFields(): string[] {
        return this.config.geometryFields;
    }

    public getSearchConfig(): [SearchSourceConfig] {
        return this.config.search;
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

    public getRelationshipsConfigs(featureLayerId: string, throwError = true): RelationshipsConfig {
        const layerConfigs = this.config.layers.filter(c => c.properties.id === featureLayerId);
        if (layerConfigs.length !== 1) {
            return this.handleError(`on layer with id "${featureLayerId}" found in configuration`, throwError);
        }
        return layerConfigs[0].relationships ?? {} as RelationshipsConfig;
    }

    public getLayerConfigs(): LayerConfig[] {
        return this.config.layers.filter(f => f.type === LayerType.FeatureLayer);
    }

    public getLayerConfigById(id: string, throwError = true): LayerConfig {
        const layerConfigs = this.config.layers.filter(f => f.properties.id === id);
        if (layerConfigs.length !== 1) {
            return this.handleError(`invalid configuration for id "${id}"`, throwError);
        }
        return layerConfigs[0];
    }

    public getLayerConfigByName(name: string, throwError = true): LayerConfig {
        const layerConfigs = this.config.layers.filter(f => f.name === name);
        if (layerConfigs.length !== 1) {
            return this.handleError(`invalid configuration for name "${name}"`, throwError);
        }
        return layerConfigs[0];
    }

    public getLayerConfigByUrl(url: string, throwError = true): LayerConfig {
        const layerConfigs = this.config.layers.filter(f => f.properties.url === url);
        if (layerConfigs.length !== 1) {
            return this.handleError(`invalid configuration for url "${url}"`, throwError);
        }
        return layerConfigs[0];
    }

    public getLayerConfig(type: LayerType, id: string, throwError = true): LayerConfig {
        const layerConfigs = this.config.layers.filter(f => f.type === type && f.properties.id === id);
        if (layerConfigs.length !== 1) {
            return this.handleError(`invalid configuration for layer-type "${type}" and id "${id}"`, throwError);
        }
        return layerConfigs[0];
    }

    private handleError(errorString: string, throwError: boolean): any {
        if (throwError) {
            throw new Error(errorString);
        }
        return;
    }
}
