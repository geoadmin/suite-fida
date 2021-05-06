export enum LayerType {
    FeatureLayer = 'FeatureLayer',
    MapImageLayer = 'MapImageLayer',
    QueryLayer = 'QueryLayer',
    RelatedLayer = 'RelatedLayer'
}

export enum SearchType {
    Locator = 'Locator',
    Layer = 'Layer',
    Fida = 'Fida'
}

export class RelationshipsConfig {
    [key: string]: string
}

export class LayerConfig {
    type: LayerType;
    name: string;
    idField: string;
    fkField: string;
    properties: any;
    relationships?: RelationshipsConfig;
}

export class VersionManagementConfig {
    serverUrl: string;
    defaultVersion: string;
}

export class ExtentConfig {
    xmax: number;
    xmin: number;
    ymax: number;
    ymin: number;
    spatialReference: any;
}

export class GpConfig {
    getParcelInfoUrl: string;
    heightUrl: string;
    lk25Url: string;
    pureComUrl: string;
    exportToFile: string;
}

export class SearchSourceConfig {
    type: SearchType;
    idLayer?: string;
    url?: string;
    properties: any;
}

export class RolesConfig {
    adminGroupName: string;
}

export class Config {
    appVersion: string;
    roles: RolesConfig;
    arcGisUrlPlaceholder: string;
    layerBaseUrl: string;
    defaultVersion: string;
    defaultExtent: ExtentConfig;
    translateTableName: string;
    workAbbreviationTableName: string;
    languages: string[];
    versionManagement: VersionManagementConfig;
    gp: GpConfig;
    geometryFields: string[];
    databaseFields: string[];
    maxGeometryDifference: number;
    layers: [LayerConfig];
    layerInfos: any;
    search: [SearchSourceConfig];
}
