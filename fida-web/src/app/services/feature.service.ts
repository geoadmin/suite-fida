import { Injectable } from '@angular/core';
import { QueryService } from './query.service';
import { ConfigService } from '../configs/config.service';
import { MessageService } from './message.service';
import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Relationship from 'esri/layers/support/Relationship';
import { FeatureState, FidaFeature, RelatedFeatures } from '../models/FidaFeature.model';
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

      // update objectid and globalid
      const addFeatureResults: __esri.FeatureEditResult[] = applyEditsResult.addFeatureResults;
      if (addFeatureResults && addFeatureResults.length === 1) {
        feature.attributes.OBJECTID = addFeatureResults[0].objectId;
        feature.attributes.GLOBALID = addFeatureResults[0].globalId;
      }

      // TODO auslagern
      // update grundbuch features
      if (featureLayer.id === "LFP" && feature.state === FeatureState.Create) {
        await this.redefineGrundbuchFeatures(feature);
      }

      // save related features
      if (feature.state !== FeatureState.Delete) {
        const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
        await Promise.all(Object.entries(feature.relatedFeatures).map(async ([key, value]) => {
          const relationshipName = relationshipsConfig[key];
          const relatedFeatures = value as FidaFeature[]

          if (relationshipName && relatedFeatures && relatedFeatures.length > 0) {
            const relatedFeatureLayer = await this.getRelatedFeatureLayerByName(featureLayer, relationshipName);

            // update fk 
            const relationship = this.getRelationship(featureLayer, relationshipName);
            relatedFeatures.forEach((f) => {
              this.updateFk(f, feature, relationship);
            })

            await this.saveRelatedFeatures(relatedFeatureLayer, relatedFeatures);
            console.log(`related features "${relationshipName}" saved.`);
          }
        }));
      }

      const successMessage = feature.state === FeatureState.Delete
        ? 'Successfully deleted' : 'Successfully saved'
      this.messageService.success(successMessage);
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

    } catch (error) {
      this.messageService.error(error);
    }
  }

  private applyEdits(featureLayer: FeatureLayer, applyEditProperties: __esri.FeatureLayerApplyEditsEdits): Promise<any> {
    const options: __esri.FeatureLayerApplyEditsOptions = {
      gdbVersion: featureLayer.gdbVersion
    }

    return new Promise((resolve, reject) => {
      featureLayer.applyEdits(applyEditProperties, options).then((result: any) => {
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

          // add attachment infos
          if(relatedFeatureLayer.capabilities.operations.supportsQueryAttachments){
            await this.loadAttachments(resultFeatures as FidaFeature[])
          }
        }

        // store related features
        (feature.relatedFeatures as any)[key] = resultFeatures;
        console.log(`related features "${value}" loaded. count=${resultFeatures.length}`);
        loadedCallback();
      }
    }));
  }

  public async loadAttachments(features: FidaFeature[]): Promise<any> {
    const featureLayer = this.getFeatureLayer(features[0]);
    const objectIds = features.map(f => f.attributes.OBJECTID);

    const attachemts = await this.queryService.attachments(featureLayer, objectIds);
    features.forEach((feature) => {
      feature.attachemtInfos = attachemts[feature.attributes.OBJECTID];
    });
  }

  public async createRelatedFeature(feature: FidaFeature, relatedFeaturesPropertyName: string): Promise<FidaFeature> {
    const featureLayer = this.getFeatureLayer(feature);
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    const relationshipName = this.getRelationshipName(relationshipsConfig, relatedFeaturesPropertyName)
    const relationship = this.getRelationship(featureLayer, relationshipName);
    const relatedFeatureLayer = await this.getRelatedFeatureLayer(featureLayer, relationship);

    // create related feature              
    const relatedFeature = new FidaFeature();
    relatedFeature.attributes = { ...relatedFeatureLayer.templates[0].prototype.attributes };
    relatedFeature.layer = relatedFeatureLayer;
    relatedFeature.state = FeatureState.Create;
    this.updateFk(relatedFeature, feature, relationship);

    // add related feature to list
    this.addRelatedFeatureToList(feature, relatedFeaturesPropertyName, relatedFeature);

    return relatedFeature;
  }

  private updateFk(relatedFeature: FidaFeature, feature: FidaFeature, relationship: Relationship) {
    const fkField = "FK_FIDA_LFP"; // TODO load aus config
    const fkValue = feature.attributes[relationship.keyField.toUpperCase()];
    relatedFeature.attributes[fkField] = fkValue;
  }

  public async redefineGrundbuchFeatures(feature: FidaFeature): Promise<any> {
    // get grundbuch  
    const parcelInfos = await this.parcelInfoService.getParcelInfo(feature.geometry);

    // flag old grundbuch features as deleted and delete new once
    this.checkRelatedFeatureList(feature, 'grundbuch');
    feature.relatedFeatures.grundbuch = feature.relatedFeatures.grundbuch.filter(f => f.attributes.OBJECTID != null);
    feature.relatedFeatures.grundbuch.map(f => (f as FidaFeature).state = FeatureState.Delete);

    // set new grundbuch features    
    const featureLayer = this.getFeatureLayer(feature);
    const grundbuchLayer = await this.getRelatedFeatureLayerByName(featureLayer, 'grundbuch');

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

  public async validateFeature(feature: FidaFeature, orginalAttributes: any): Promise<boolean> {
    // TODO layer id auslagern
    if (feature.layer.id === "LFP") {
      // check of valid LK25
      if (feature.attributes.LV95E !== orginalAttributes.LV95E
        || feature.attributes.LV95N !== orginalAttributes.LV95N
        || feature.attributes.LK25 !== orginalAttributes.LK25) {

      }
    }
    const point = feature.geometry as Point;
    const tileId = await this.lk25Service.getTileId(point);
    return feature.attributes.LK25 === tileId;
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

  private addRelatedFeatureToList(feature: FidaFeature, relatedName: string, related: FidaFeature): void {
    this.checkRelatedFeatureList(feature, relatedName);
    (feature.relatedFeatures as any)[relatedName].push(related);
  }

  private checkRelatedFeatureList(feature: FidaFeature, relatedName: string): void {
    if (!feature.relatedFeatures) {
      feature.relatedFeatures = new RelatedFeatures();
    }
    if (!((feature.relatedFeatures as any)[relatedName])) {
      (feature.relatedFeatures as any)[relatedName] = [];
    }
  }

  private getFeatureLayer(feature: Feature): FeatureLayer {
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

  private async getRelatedFeatureLayerByName(featureLayer: FeatureLayer, relationshipName: string): Promise<FeatureLayer> {
    const relationship = this.getRelationship(featureLayer, relationshipName);
    return this.getRelatedFeatureLayer(featureLayer, relationship);
  }

  private async getRelatedFeatureLayer(featureLayer: FeatureLayer, relationship: Relationship): Promise<FeatureLayer> {
    const relatedFeatureLayerUrl = featureLayer.url + '/' + relationship.relatedTableId;

    // check of already loaded related feature layer
    let relatedFeatureLayer = this.relatedFeatureLayers.find(f => f.url === featureLayer.url
      && f.layerId === relationship.relatedTableId
      && f.gdbVersion === featureLayer.gdbVersion)

    // otherwise create related feature layer
    if (relatedFeatureLayer === undefined) {
      relatedFeatureLayer = new FeatureLayer({
        gdbVersion: featureLayer.gdbVersion,
        url: featureLayer.url,
        layerId: relationship.relatedTableId
      });

      this.relatedFeatureLayers.push(relatedFeatureLayer)
    }

    await relatedFeatureLayer.load();
    return relatedFeatureLayer;
  }

  private getRelationship(featureLayer: FeatureLayer, relationshipName: string): Relationship {
    const relationship = featureLayer.relationships.find(f => f.name.toLowerCase() === relationshipName.toLowerCase());
    if (!relationship) {
      throw new Error(`relationship wiht name "${relationshipName}" not found`);
    }
    return relationship;
  }

  private getRelationshipName(relationshipsConfig: RelationshipsConfig, relatedFeaturesPropertyName: string): string {
    const name = (relationshipsConfig as any)[relatedFeaturesPropertyName];
    if (name === undefined) {
      throw new Error(`relationshipConfig with property "${relatedFeaturesPropertyName}" not found`)
    }
    return name;
  }
}
