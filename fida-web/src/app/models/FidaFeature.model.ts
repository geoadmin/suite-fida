import Feature from '@arcgis/core/Graphic';
import AttachmentInfo from '@arcgis/core/layers/support/AttachmentInfo';

export enum FeatureState {
    Create = 'create',
    Edit = 'edit',
    Delete = 'delete',
    EditGeometry = 'edit-geometry'
}

// key must be tha same as the value
export enum RelationshipName {
    grundbuch = 'grundbuch',
    kontakt = 'kontakt',
    nachfuehrung = 'nachfuehrung',
    rueckversicherung = 'rueckversicherung',
    anhang = 'anhang',
    auslandpunkt = 'auslandpunkt',
    schaeden = 'schaeden',
    schweremessung = 'schweremessung'
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
    /**
     * copy from attributes after load.
     * originalAttributes can be used to check of changes or reset changes
     */
    originalAttributes: any;
    /**
     * current tab open in view/edit
     */
    activeTab: string;
    /**
     * language from feature depending on location
     */
    language: string;
}

