export enum LayerType {
    FeatureLayer = 'FeatureLayer',
    MapImageLayer = 'MapImageLayer',
    QueryLayer = 'QueryLayer',
    RelatedLayer = 'RelatedLayer'
}

export enum RelationshipName {
    Grundbuch = 'grundbuch',
    Nachfuehrung = 'nachfuehrungen',
    Rueckversicherung = 'rueckversicherung',
    Kontakt = 'kontakt'
}

export class RelationshipsConfig_OLD {
    grundbuch: string;
    nachfuehrungen: string;
    rueckversicherung: string;
    kontakt: string;
}

export class RelationshipsConfig {
    [key: string]: string
}

export class LayerConfig {
    type: LayerType;
    properties: any;
    relationships?: RelationshipsConfig;
    idField?: string;
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

export class Config {
    arcGisUrlPlaceholder: string;
    defaultVersion: string;
    defaultExtent: ExtentConfig;
    versionManagement: VersionManagementConfig;
    layers: [LayerConfig];
    layerInfos: any;
}