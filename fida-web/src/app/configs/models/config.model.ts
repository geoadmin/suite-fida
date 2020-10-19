export enum LayerType {
    FeatureLayer = "FeatureLayer",
    MapImageLayer = "MapImageLayer"
}

export class RelationshipConfig {
    name: string;
    relationshipId: number;
}

export class LayerConfig {
    type: LayerType;
    properties: any;
    relationships: [RelationshipConfig];
}

export class Config {
    arcGisUrlPlaceholder: string;
    layers: [LayerConfig];
}
