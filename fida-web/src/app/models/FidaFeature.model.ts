import Feature from 'esri/Graphic';

export enum FeatureState {
    Create = 'create',
    Edit = 'edit',
    Delete = 'delete',
    EditGeometry = 'edit-geometry'
}

export class RelatedFeatures {
    grundbuch?: Feature[];
    kontakt?: Feature[];
    nachfuehrung?: Feature[];
    rueckversicherung?: Feature[];
}

export class FidaFeature extends Feature {
    state: FeatureState;
    relatedFeatures: RelatedFeatures;
}

/*export class LfpFeature extends Feature {
    grundbuchFeatures?: Feature[];
}*/
