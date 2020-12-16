export enum LayerType {
    FeatureLayer = 'FeatureLayer',
    MapImageLayer = 'MapImageLayer',
    QueryLayer = 'QueryLayer',
    RelatedLayer = 'RelatedLayer'
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
    getHeightUrl: string;
    getLK25Url: string;
}

export class Config {
    arcGisUrlPlaceholder: string;
    layerBaseUrl: string;
    defaultVersion: string;
    defaultExtent: ExtentConfig;
    translateTableName: string;
    languages: string[];
    versionManagement: VersionManagementConfig;
    gp: GpConfig;
    layers: [LayerConfig];
    layerInfos: any;
}
