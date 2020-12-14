import Feature from 'esri/Graphic';
import AttachmentInfo from 'esri/layers/support/AttachmentInfo';

export enum FeatureState {
    Create = 'create',
    Edit = 'edit',
    Delete = 'delete',
    EditGeometry = 'edit-geometry'
}

export enum RelationshipName {
    Grundbuch = 'grundbuch',
    Kontakt = 'kontakt',
    Nachfuehrung = 'nachfuehrung',
    Rueckversicherung = 'rueckversicherung',
    Anhang = 'anhang',
    Auslandpunkt = 'auslandpunkt',
    Schaeden = 'schaeden',
    Schweremessung = 'schweremessung'   
}

export enum LayerId {
    LFP = 'LFP',
    HFP = 'HFP',
    LSN = 'LSN'
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

