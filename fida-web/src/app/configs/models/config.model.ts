export enum LayerType {
    FeatureLayer = "FeatureLayer",
    MapImageLayer = "MapImageLayer"
}

export class LayerConfig {
    type: LayerType;
    properties: any;
}

export class Config {
    arcGisUrlPlaceholder: string;
    layers: [LayerConfig];
}
