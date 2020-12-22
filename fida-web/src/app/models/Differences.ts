export class DifferenceFeature {
    attributes?: any;
    geometry?: any;
}
export class Differences {
    layerId: string;
    inserts?: DifferenceFeature[];
    updates?: DifferenceFeature[];
    deletes?: DifferenceFeature[];
}
