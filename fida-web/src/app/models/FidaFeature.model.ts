import Feature from 'esri/Graphic';
import AttachmentInfo from 'esri/layers/support/AttachmentInfo';

export enum FeatureState {
    Create = 'create',
    Edit = 'edit',
    Delete = 'delete',
    EditGeometry = 'edit-geometry'
}

export class RelatedFeatures {
    grundbuch?: FidaFeature[];
    kontakt?: FidaFeature[];
    nachfuehrung?: FidaFeature[];
    rueckversicherung?: FidaFeature[];
    anhang?: FidaFeature[];
    auslandpunkt?: FidaFeature[];
    schaeden?: FidaFeature[];
    schweremessung?: FidaFeature[];
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
