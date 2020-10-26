export enum LayerType {
    FeatureLayer = "FeatureLayer",
    MapImageLayer = "MapImageLayer",
    QueryLayer = "QueryLayer"
}

export class RelationshipConfig {
    name: string;
    relationshipId: number;
}

export class LayerConfig {
    type: LayerType;
    properties: any;
    relationships?: [RelationshipConfig];
}

export class Config {
    arcGisUrlPlaceholder: string;
    layers: [LayerConfig];
}
