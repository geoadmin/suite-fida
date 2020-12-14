import { Injectable } from '@angular/core';
import { QueryService } from './query.service';
import { ConfigService } from '../configs/config.service';
import { MessageService } from './message.service';
import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import EsriRelationship from 'esri/layers/support/Relationship';
import { FeatureState, FidaFeature, LayerId, RelatedFeatures, RelationshipName } from '../models/FidaFeature.model';
import { ParcelInfoService } from './parcel-info.service';
import { RelationshipsConfig } from '../models/config.model';
import Point from 'esri/geometry/Point';
import { HeightService } from './height.service';
import { Lk25Service } from './lk25.service';



@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private relatedFeatureLayers: FeatureLayer[] = [];

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private queryService: QueryService,
    private parcelInfoService: ParcelInfoService,
    private heightService: HeightService,
    private lk25Service: Lk25Service
  ) { }

  public async saveFeature(feature: FidaFeature): Promise<any> {
    try {
      // create save properties
      const applyEditProperties: __esri.FeatureLayerApplyEditsEdits = {};
      if (feature.state === FeatureState.Create) {
        applyEditProperties.addFeatures = [feature];
      } else if (feature.state === FeatureState.Delete) {
        applyEditProperties.deleteFeatures = [feature];
      } else {
        applyEditProperties.updateFeatures = [feature];
      }

      // save feature
      const featureLayer = this.getFeatureLayer(feature);
      const applyEditsResult = await this.applyEdits(featureLayer, applyEditProperties);

      // save related features
      if (feature.state !== FeatureState.Delete) {
        const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
        await Promise.all(Object.entries(feature.relatedFeatures).map(async ([key, value]) => {
          const relationshipName: RelationshipName = (<any>RelationshipName)[relationshipsConfig[key]];
          const relatedFeatures = value as FidaFeature[]

          if (relationshipName && relatedFeatures && relatedFeatures.length > 0) {
            const relatedFeatureLayer = await this.getRelatedFeatureLayerByName(featureLayer, relationshipName);

            // update fk 
            const esriRelationship = this.getEsriRelationship(featureLayer, relationshipName);
            relatedFeatures.forEach((f) => {
              this.updateFk(f, feature, esriRelationship);
            })

            // correct deleted kontakt features
            if (relationshipName === RelationshipName.Kontakt) {
              this.correctDeletedKontaktFeatures(feature, relatedFeatures);
            }

            await this.saveRelatedFeatures(relatedFeatureLayer, relatedFeatures);
            console.log(`related features "${relationshipName}" saved.`);
          }
        }));
      }

      const successMessage = feature.state === FeatureState.Delete
        ? 'Successfully deleted' : 'Successfully saved'
      this.messageService.success(successMessage);

      // reset state
      feature.state = undefined;
    } catch (error) {
      this.messageService.error(error);
    }
  }

  public async saveRelatedFeatures(relatedFeatureLayer: FeatureLayer, relatedFeatures: FidaFeature[]): Promise<any> {
    try {

      // check empty related features
      if (!relatedFeatures || relatedFeatures.length === 0) {
        return Promise.resolve();
      }

      // create save properties
      const applyEditProperties: __esri.FeatureLayerApplyEditsEdits = {};
      applyEditProperties.addFeatures = relatedFeatures.filter(f => f.state === FeatureState.Create);
      applyEditProperties.deleteFeatures = relatedFeatures.filter(f => f.state === FeatureState.Delete);
      applyEditProperties.updateFeatures = relatedFeatures.filter(f => f.state === FeatureState.Edit || f.state === undefined);

      // save related features     
      await this.applyEdits(relatedFeatureLayer, applyEditProperties);

      // add attachments
      if (relatedFeatureLayer.capabilities.operations.supportsQueryAttachments) {
        this.addAttachment(relatedFeatureLayer, relatedFeatures);
      }

      // reset state
      relatedFeatures.map(f => f.state = undefined);
    } catch (error) {
      this.messageService.error(error);
    }
  }

  private correctDeletedKontaktFeatures(feature: FidaFeature, relatedFeatures: FidaFeature[]) {
    // just delete kontakt-feature if no other relations are present
    const fkField = this.configService.getLayerConfigById(feature.layer.id).fkField;
    const lfpFkField = this.configService.getLayerConfigById(LayerId.LFP).fkField;
    const hfpFkField = this.configService.getLayerConfigById(LayerId.HFP).fkField;

    const deletedFeatures = relatedFeatures.filter(f => f.state === FeatureState.Delete);
    deletedFeatures.forEach(deletedFeature => {
      deletedFeature.attributes[fkField] = null;      
      if (deletedFeature.attributes[lfpFkField] === null && deletedFeature.attributes[hfpFkField] === null) {
        deletedFeature.state = FeatureState.Delete; 
      } else {
        deletedFeature.state = FeatureState.Edit; 
      }
    });
  }

  private async addAttachment(featureLayer: FeatureLayer, features: FidaFeature[]): Promise<boolean> {
    let attachmentAdded = false;
    features.forEach(async (feature: FidaFeature) => {
      if (feature.attachmentUpload != null) {

        const form = new FormData();
        form.set('attachment', feature.attachmentUpload);
        form.append('f', 'json');
        await featureLayer.addAttachment(feature, form);

        feature.attachmentUpload = undefined;
        attachmentAdded = true;
      }
    });
    return attachmentAdded;
  }

  private applyEdits(featureLayer: FeatureLayer, applyEditProperties: __esri.FeatureLayerApplyEditsEdits): Promise<any> {
    const options: __esri.FeatureLayerApplyEditsOptions = {
      gdbVersion: featureLayer.gdbVersion
    }

    return new Promise((resolve, reject) => {
      featureLayer.applyEdits(applyEditProperties, options).then((result: any) => {

        // update objectid and globalid
        const features = applyEditProperties.addFeatures as Feature[];
        const addFeatureResults: __esri.FeatureEditResult[] = result.addFeatureResults;
        if (features) {
          for (let i = 0; i < features.length; i++) {
            features[i].attributes.OBJECTID = addFeatureResults[0].objectId;
            features[i].attributes.GLOBALID = addFeatureResults[0].globalId;
          }
        }

        resolve(result);
      }).catch((error: any) => {
        this.messageService.error('Save failed.', error);
        reject(error);
      });
    });
  }

  public async loadRelatedFeatures(feature: FidaFeature, loadedCallback: () => void): Promise<any> {
    if (!feature.layer) {
      return;
    }
    feature.relatedFeatures = {};
    const featureLayer = this.getFeatureLayer(feature);

    // query all related features async
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    return Promise.all(Object.entries(relationshipsConfig).map(async ([key, value]) => {
      const relationship = featureLayer.relationships.find(f => f.name.toLowerCase() === value.toLowerCase())
      if (relationship) {
        const resultFeatures = await this.queryService.relatedFeatures(featureLayer, feature.attributes.OBJECTID, relationship.id);

        // add related-feature-layer to features
        if (resultFeatures.length > 0) {
          const relatedFeatureLayer = await this.getRelatedFeatureLayer(featureLayer, relationship);
          resultFeatures.forEach(relatedFeature => {
            relatedFeature.layer = relatedFeatureLayer;
          });

          // load attachment infos
          if (relatedFeatureLayer.capabilities.operations.supportsQueryAttachments) {
            await this.loadAttachments(relatedFeatureLayer, resultFeatures as FidaFeature[]);
          }
        }

        // store related features
        (feature.relatedFeatures as any)[key] = resultFeatures;
        console.log(`related features "${value}" loaded. count=${resultFeatures.length}`);
        loadedCallback();
      }
    }));
  }

  public async loadAttachments(featureLayer: FeatureLayer, features: FidaFeature[]): Promise<any> {
    const objectIds = features.map(f => f.attributes.OBJECTID);

    const attachemts = await this.queryService.attachments(featureLayer, objectIds);
    features.forEach((feature) => {
      feature.attachmentInfos = attachemts[feature.attributes.OBJECTID];
    });
  }

  public async createRelatedFeature(feature: FidaFeature, relationshipName: RelationshipName, addToFeature: boolean = true): Promise<FidaFeature> {
    const featureLayer = this.getFeatureLayer(feature);
    const esriRelationship = this.getEsriRelationship(featureLayer, relationshipName);
    const relatedFeatureLayer = await this.getRelatedFeatureLayer(featureLayer, esriRelationship);

    // create related feature              
    const relatedFeature = new FidaFeature();
    relatedFeature.attributes = { ...relatedFeatureLayer.templates[0].prototype.attributes };
    relatedFeature.layer = relatedFeatureLayer;
    relatedFeature.state = FeatureState.Create;
    this.updateFk(relatedFeature, feature, esriRelationship);

    // add related feature to list
    if (addToFeature === true) {
      this.addRelatedFeatureToList(feature, relationshipName, relatedFeature);
    }

    return relatedFeature;
  }

  private updateFk(relatedFeature: FidaFeature, feature: FidaFeature, esriRelationship: EsriRelationship) {
    const fkField = this.configService.getLayerConfigById(feature.layer.id).fkField;
    const fkValue = feature.attributes[esriRelationship.keyField.toUpperCase()];
    relatedFeature.attributes[fkField] = fkValue;
  }

  public async redefineGrundbuchFeatures(feature: FidaFeature): Promise<any> {
    // check of grundbuch relationship
    const featureLayer = this.getFeatureLayer(feature);
    if (this.hasRelationship(featureLayer, RelationshipName.Grundbuch) == false) {
      return;
    }

    // get grundbuch  
    const parcelInfos = await this.parcelInfoService.getParcelInfo(feature.geometry);

    // flag old grundbuch features as deleted and delete new once
    this.checkRelatedFeatureList(feature, RelationshipName.Grundbuch);
    feature.relatedFeatures.grundbuch = feature.relatedFeatures.grundbuch.filter(f => f.attributes.OBJECTID != null);
    feature.relatedFeatures.grundbuch.map(f => (f as FidaFeature).state = FeatureState.Delete);

    // set new grundbuch features    
    const grundbuchLayer = await this.getRelatedFeatureLayerByName(featureLayer, RelationshipName.Grundbuch);
    parcelInfos.forEach((parcelInfo) => {
      let grundbuchFeature = new FidaFeature();
      grundbuchFeature.attributes = { ...grundbuchLayer.templates[0].prototype.attributes };
      grundbuchFeature.attributes.LAND = 'CH';
      grundbuchFeature.attributes.KANTON = parcelInfo.Kanton.substring(0, 2);
      grundbuchFeature.attributes.BEZIRK = parcelInfo.Bezirk;
      grundbuchFeature.attributes.GEMEINDE = parcelInfo.Gemeinde;
      grundbuchFeature.attributes.PARZ = parcelInfo.ParzNummer;
      grundbuchFeature.state = FeatureState.Create;
      grundbuchFeature.layer = grundbuchLayer;
      feature.relatedFeatures.grundbuch.push(grundbuchFeature);
    });

    if (parcelInfos.length === 0) {
      this.messageService.warning('No Grundbuchdaten found.');
    }
  }

  public updateGeometryFromAttributes(feature: FidaFeature): void {
    const point = (feature.geometry as Point);
    if (point && feature.attributes.LV95E != null && feature.attributes.LV95N != null) {
      point.x = feature.attributes.LV95E;
      point.y = feature.attributes.LV95N;
      point.z = feature.attributes.LN02;
    }
  }

  public updateAttributesFromGeometry(feature: FidaFeature): void {
    const point = feature.geometry as Point;
    if (point) {
      feature.attributes.LV95E = point.x;
      feature.attributes.LV95N = point.y;
      feature.attributes.LN02 = point.z;
    }
  }

  public async updateGeometry(feature: FidaFeature): Promise<void> {
    const point = feature.geometry as Point;
    if (point) {
      const height = await this.heightService.getHeight(point);
      point.z = height;
    }
  }

  public async updateLK25(feature: FidaFeature): Promise<void> {
    const point = feature.geometry as Point;
    if (point) {
      const tileId = await this.lk25Service.getTileId(point);
      feature.attributes.LK25 = tileId;
    }
  }

  public getFeatureName(feature: FidaFeature): string {
    if (!feature) { return; }

    const idField = this.configService.getLayerConfigById(feature.layer.id).idField;
    let id = feature.attributes[idField];
    if (id == null) {
      return feature.layer.id;
    }
    return `${feature.layer.id}-${id}`;
  }

  public addRelatedFeatureToList(feature: FidaFeature, relationshipName: RelationshipName, related: FidaFeature): void {
    this.checkRelatedFeatureList(feature, relationshipName);
    (feature.relatedFeatures as any)[relationshipName.toLocaleLowerCase()].push(related);
  }

  private checkRelatedFeatureList(feature: FidaFeature, relationshipName: RelationshipName): void {
    const relatedName: string = relationshipName.toLocaleLowerCase();
    if (!feature.relatedFeatures) {
      feature.relatedFeatures = new RelatedFeatures();
    }
    if (!((feature.relatedFeatures as any)[relatedName])) {
      (feature.relatedFeatures as any)[relatedName] = [];
    }
  }

  public getFeatureLayer(feature: Feature): FeatureLayer {
    let featureLayer = feature.layer as FeatureLayer;
    if (!featureLayer) {
      // try sourceLayer
      featureLayer = (feature as any).sourceLayer as FeatureLayer;
      if (!featureLayer) {
        throw new Error(`layer ${feature.layer.id} is no FeatureLayer`);
      }
    }
    return featureLayer;
  }

  public async getRelatedFeatureLayerByName(featureLayer: FeatureLayer, relationshipName: RelationshipName): Promise<FeatureLayer> {
    const esriRelationship = this.getEsriRelationship(featureLayer, relationshipName);
    return this.getRelatedFeatureLayer(featureLayer, esriRelationship);
  }

  private async getRelatedFeatureLayer(featureLayer: FeatureLayer, esriRelationship: EsriRelationship): Promise<FeatureLayer> {
    const relatedFeatureLayerUrl = featureLayer.url + '/' + esriRelationship.relatedTableId;

    // check of already loaded related feature layer
    let relatedFeatureLayer = this.relatedFeatureLayers.find(f => f.url === featureLayer.url
      && f.layerId === esriRelationship.relatedTableId
      && f.gdbVersion === featureLayer.gdbVersion)

    // otherwise create related feature layer
    if (relatedFeatureLayer === undefined) {
      relatedFeatureLayer = new FeatureLayer({
        gdbVersion: featureLayer.gdbVersion,
        url: featureLayer.url,
        layerId: esriRelationship.relatedTableId
      });

      this.relatedFeatureLayers.push(relatedFeatureLayer)
    }

    await relatedFeatureLayer.load();
    return relatedFeatureLayer;
  }

  private hasRelationship(featureLayer: FeatureLayer, relationshipName: RelationshipName): boolean {
    // find esri-relationship-name (stored in config)
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    const esriRelationshipName = this.getEsriRelationshipName(relationshipsConfig, relationshipName)
    const relationship = featureLayer.relationships.find(f => f.name.toLowerCase() === esriRelationshipName.toLowerCase());
    return relationship !== undefined;
  }

  private getEsriRelationship(featureLayer: FeatureLayer, relationshipName: RelationshipName): EsriRelationship {
    // find esri-relationship-name (stored in config)
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    const esriRelationshipName = this.getEsriRelationshipName(relationshipsConfig, relationshipName)
    const esriRelationship = featureLayer.relationships.find(f => f.name.toLowerCase() === esriRelationshipName.toLowerCase());
    if (!esriRelationship) {
      throw new Error(`no relationship with name "${relationshipName}" for layer ${featureLayer.title} found`);
    }
    return esriRelationship;
  }

  private getEsriRelationshipName(relationshipsConfig: RelationshipsConfig, relationshipName: RelationshipName): string {
    const name = (relationshipsConfig as any)[relationshipName.toString()];
    if (name === undefined) {
      throw new Error(`relationshipConfig with property "${relationshipName}" not found`)
    }
    return name;
  }
}
