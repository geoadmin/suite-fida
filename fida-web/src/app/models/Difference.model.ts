import { FeatureState } from './FidaFeature.model';
import { GdbVersion } from './GdbVersion.model';

export class DefaultFeatureMemeory {
    layerId: number;
    objectIds: number[];
}

export class EsriDifferences {
    layerId: number;
    inserts?: EsriDifferenceFeature[];
    updates?: EsriDifferenceFeature[];
    deletes?: EsriDifferenceFeature[];
}

export class EsriDifferenceFeature {
    attributes?: any;
    geometry?: any;
    isLinked?: boolean;
}

export class FidaDifferences {
    date: Date;
    version: GdbVersion;
    groups: FidaDifferenceGroup[];
}

export class FidaDifferenceGroup {
    name: string;
    features: FidaDifferenceFeature[];
}

export class FidaDifferenceFeature {
    globalId: string;
    objectId: number;
    layerName: string;
    layerId: string;
    state: FeatureState;
    attributes: FidaDifferenceAttribute[];
    relatedFeatures?: FidaDifferenceGroup[];
}

export class FidaDifferenceAttribute {
    name: string;
    versionValue: any;
    defaultValue?: any;
    state?: FeatureState;
}


