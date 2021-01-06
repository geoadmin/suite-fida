import { FidaFeature } from './FidaFeature.model';

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

export class FidaDifference {
    defaultFeature: FidaFeature;
    versionFeature: FidaFeature;
}

