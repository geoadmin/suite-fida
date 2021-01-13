
export class DefaultFeatureMemeory {
    layerId: number;
    objectIds: number[];
}

export class DifferenceFeature {
    attributes?: any;
    geometry?: any;
}

export class Differences {
    layerId: number;
    inserts?: DifferenceFeature[];
    updates?: DifferenceFeature[];
    deletes?: DifferenceFeature[];
}

