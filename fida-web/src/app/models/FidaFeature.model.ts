import Feature from 'esri/Graphic';
import AttachmentInfo from 'esri/layers/support/AttachmentInfo';

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
    anhang?: Feature[];
}

export class FidaFeature extends Feature {
    state: FeatureState;
    relatedFeatures: RelatedFeatures;
    attachmentInfos: AttachmentInfo[];
    attachmentUpload: any;
}

/*export class LfpFeature extends Feature {
    grundbuchFeatures?: Feature[];
}*/
