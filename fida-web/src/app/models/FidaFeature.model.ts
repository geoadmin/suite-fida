import Feature from 'esri/Graphic';

export enum FeatureState {
    Create = 'create',
    Edit = 'edit',
    Delete = 'delete',
    EditGeometry = 'edit-geometry'
}

export class FidaFeature extends Feature {
    state: FeatureState;
    grundbuchFeatures?: Feature[];
}

/*export class LfpFeature extends Feature {
    grundbuchFeatures?: Feature[];
}*/
