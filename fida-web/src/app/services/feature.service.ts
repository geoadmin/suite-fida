import { Injectable } from '@angular/core';
import { QueryService } from './query.service';
import { ConfigService } from '../configs/config.service';
import { MessageService } from './message.service';
import Feature from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriRelationship from '@arcgis/core/layers/support/Relationship';
import { FeatureState, FidaFeature, LayerId, RelatedFeatures, RelationshipName } from '../models/FidaFeature.model';
import { ParcelInfoService } from './parcel-info.service';
import { RelationshipsConfig } from '../models/config.model';
import Point from '@arcgis/core/geometry/Point';
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

  public async saveFeature(feature: FidaFeature): Promise<boolean> {
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
        // NOTE: do not call applyEdits parrallel (await Promise.all) because the can be a lock error
        for (const [key, value] of Object.entries(feature.relatedFeatures)) {
          const relationshipName: RelationshipName = (RelationshipName as any)[key];
          const relatedFeatures = value as FidaFeature[];


          if (relationshipName && relatedFeatures && relatedFeatures.length > 0) {
            const relatedFeatureLayer = await this.getRelatedFeatureLayerByName(featureLayer, relationshipName);

            // update fk
            const esriRelationship = this.getEsriRelationship(featureLayer, relationshipName);
            relatedFeatures.forEach((f) => {
              this.updateFk(f, feature, esriRelationship);
            });

            // correct deleted kontakt features
            if (relationshipName === RelationshipName.kontakt) {
              this.correctDeletedKontaktFeatures(feature, relatedFeatures);
            }

            const saved = await this.saveRelatedFeatures(relatedFeatureLayer, relatedFeatures);
            if (saved === true) {
              console.log(`related features "${relationshipName}" saved.`);
            }
          }
        }
      } else {
        this.deleteUnlinkedKontaktFeatures(featureLayer);
      }

      const successMessage = feature.state === FeatureState.Delete
        ? 'Successfully deleted' : 'Successfully saved';
      this.messageService.success(successMessage);

      // reset state
      feature.state = undefined;
      feature.originalAttributes = { ...feature.attributes };
    } catch (error) {
      return false;
    }
    return true;
  }

  public async saveRelatedFeatures(relatedFeatureLayer: FeatureLayer, relatedFeatures: FidaFeature[]): Promise<boolean> {
    let saved = false;
    try {

      // check empty related features
      if (!relatedFeatures || relatedFeatures.length === 0) {
        return Promise.resolve(false);
      }

      // find changes
      relatedFeatures.filter(f => f.state === undefined
        && JSON.stringify(f.originalAttributes) !== JSON.stringify(f.attributes)).map(feature => {
          feature.state = FeatureState.Edit;
          console.log(feature.attributes.OBJECTID);
        });

      // create save properties
      const applyEditProperties: __esri.FeatureLayerApplyEditsEdits = {};
      applyEditProperties.addFeatures = relatedFeatures.filter(f => f.state === FeatureState.Create);
      applyEditProperties.deleteFeatures = relatedFeatures.filter(f => f.state === FeatureState.Delete);
      applyEditProperties.updateFeatures = relatedFeatures.filter(f => f.state === FeatureState.Edit);

      // save related features
      if (applyEditProperties.addFeatures.length > 0
        || applyEditProperties.deleteFeatures.length > 0
        || applyEditProperties.updateFeatures.length > 0) {
        await this.applyEdits(relatedFeatureLayer, applyEditProperties);
        saved = true;
      }

      // add attachments
      if (relatedFeatureLayer.capabilities.operations.supportsQueryAttachments) {
        this.addAttachment(relatedFeatureLayer, relatedFeatures);
      }

      // reset state
      relatedFeatures.map(f => {
        f.state = undefined;
        f.originalAttributes = { ...f.attributes };
      });
    } catch (error) {
      this.messageService.error(error);
    }
    return Promise.resolve(saved);
  }

  private correctDeletedKontaktFeatures(feature: FidaFeature, relatedFeatures: FidaFeature[]): void {
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

  private async deleteUnlinkedKontaktFeatures(featureLayer: FeatureLayer): Promise<void> {
    // find features
    const kntaktFeatureLayer = await this.getRelatedFeatureLayerByName(featureLayer, RelationshipName.kontakt);
    const where = 'FK_FIDA_LFP IS NULL AND FK_FIDA_HFP IS NULL';
    const outFields = ['OBJECTID'];
    const unlinkedFeatures = await this.queryService.where(kntaktFeatureLayer, where, outFields);

    // delete features
    if (unlinkedFeatures.length > 0) {
      console.log(`delete unlinked kontakt features with id ${unlinkedFeatures.map(m => m.attributes.OBJECID).join(',')}`);
      const applyEditProperties: __esri.FeatureLayerApplyEditsEdits = {};
      applyEditProperties.deleteFeatures = unlinkedFeatures;
      this.applyEdits(kntaktFeatureLayer, applyEditProperties);
    }
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
    };

    return new Promise((resolve, reject) => {
      featureLayer.applyEdits(applyEditProperties, options).then((result: any) => {

        // update objectid and globalid
        const features = applyEditProperties.addFeatures as Feature[];
        const addFeatureResults: __esri.FeatureEditResult[] = result.addFeatureResults;
        if (features) {
          for (let i = 0; i < features.length; i++) {
            features[i].attributes.OBJECTID = addFeatureResults[i].objectId;
            features[i].attributes.GLOBALID = addFeatureResults[i].globalId;
          }
        }

        resolve(result);
      }).catch((error: any) => {
        this.messageService.error('Save failed.', error);
        reject(error);
      });
    });
  }

  public async loadFeature(featureLayer: FeatureLayer, objectId: number): Promise<FidaFeature> {
    await featureLayer.load();
    const feature = await this.queryService.feature(featureLayer, objectId);
    await this.loadRelatedFeatures(feature);
    return feature;
  }

  public async loadRelatedFeatures(feature: FidaFeature, loadedCallback?: () => void): Promise<any> {
    if (!feature.layer) {
      return;
    }
    feature.relatedFeatures = {};
    const featureLayer = this.getFeatureLayer(feature);

    // query all related features async
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    return Promise.all(Object.entries(relationshipsConfig).map(async ([key, value]) => {
      const relationship = featureLayer.relationships.find(f => f.name.toLowerCase() === value.toLowerCase());
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
        if (loadedCallback) {
          loadedCallback();
        }
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

  public async createRelatedFeature(feature: FidaFeature, relationshipName: RelationshipName, addToFeature: boolean = true)
    : Promise<FidaFeature> {
    const featureLayer = this.getFeatureLayer(feature);
    const esriRelationship = this.getEsriRelationship(featureLayer, relationshipName);
    const relatedFeatureLayer = await this.getRelatedFeatureLayer(featureLayer, esriRelationship);

    // create related feature
    const relatedFeature = new FidaFeature();
    relatedFeature.attributes = { ...relatedFeatureLayer.templates[0].prototype.attributes };
    relatedFeature.layer = relatedFeatureLayer;
    relatedFeature.state = FeatureState.Create;
    relatedFeature.originalAttributes = { ...relatedFeature.attributes };
    this.updateFk(relatedFeature, feature, esriRelationship);

    // add related feature to list
    if (addToFeature === true) {
      this.addRelatedFeatureToList(feature, relationshipName, relatedFeature);
    }

    return relatedFeature;
  }

  private updateFk(relatedFeature: FidaFeature, feature: FidaFeature, esriRelationship: EsriRelationship): void {
    const fkField = this.configService.getLayerConfigById(feature.layer.id).fkField;
    const fkValue = feature.attributes[esriRelationship.keyField.toUpperCase()];
    relatedFeature.attributes[fkField] = fkValue;
  }

  public async redefineGrundbuchFeatures(feature: FidaFeature): Promise<any> {
    // check of grundbuch relationship
    const featureLayer = this.getFeatureLayer(feature);
    if (this.hasRelationship(featureLayer, RelationshipName.grundbuch) === false) {
      return;
    }

    // get grundbuch
    const parcelInfos = await this.parcelInfoService.getParcelInfo(feature.geometry);

    // flag old grundbuch features as deleted and delete new once
    this.checkRelatedFeatureList(feature, RelationshipName.grundbuch);
    feature.relatedFeatures.grundbuch = feature.relatedFeatures.grundbuch.filter(f => f.attributes.OBJECTID != null);
    feature.relatedFeatures.grundbuch.map(f => (f as FidaFeature).state = FeatureState.Delete);

    // set new grundbuch features
    const grundbuchLayer = await this.getRelatedFeatureLayerByName(featureLayer, RelationshipName.grundbuch);
    parcelInfos.forEach((parcelInfo) => {
      const grundbuchFeature = new FidaFeature();
      grundbuchFeature.attributes = { ...grundbuchLayer.templates[0].prototype.attributes };
      grundbuchFeature.attributes.LAND = 'CH';
      grundbuchFeature.attributes.KANTON = parcelInfo.Kanton.substring(0, 2);
      grundbuchFeature.attributes.BEZIRK = parcelInfo.Bezirk;
      grundbuchFeature.attributes.GEMEINDE = parcelInfo.Gemeinde;
      grundbuchFeature.attributes.PARZ = parcelInfo.ParzNummer;
      grundbuchFeature.state = FeatureState.Create;
      grundbuchFeature.layer = grundbuchLayer;
      grundbuchFeature.originalAttributes = { ...grundbuchFeature.attributes };
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
    const id = feature.attributes[idField];
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
      && f.gdbVersion === featureLayer.gdbVersion);

    // otherwise create related feature layer
    if (relatedFeatureLayer === undefined) {
      relatedFeatureLayer = new FeatureLayer({
        gdbVersion: featureLayer.gdbVersion,
        url: featureLayer.url,
        layerId: esriRelationship.relatedTableId
      });

      this.relatedFeatureLayers.push(relatedFeatureLayer);
    }

    await relatedFeatureLayer.load();
    return relatedFeatureLayer;
  }

  private hasRelationship(featureLayer: FeatureLayer, relationshipName: RelationshipName): boolean {
    // find esri-relationship-name (stored in config)
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    const name = (relationshipsConfig as any)[relationshipName.toString()];
    if (name === undefined) {
      return false;
    }
  }

  private getEsriRelationship(featureLayer: FeatureLayer, relationshipName: RelationshipName): EsriRelationship {
    // find esri-relationship-name (stored in config)
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    const esriRelationshipName = this.getEsriRelationshipName(relationshipsConfig, relationshipName);
    const esriRelationship = featureLayer.relationships.find(f => f.name.toLowerCase() === esriRelationshipName.toLowerCase());
    if (!esriRelationship) {
      throw new Error(`no relationship with name "${relationshipName}" for layer ${featureLayer.title} found`);
    }
    return esriRelationship;
  }

  private getEsriRelationshipName(relationshipsConfig: RelationshipsConfig, relationshipName: RelationshipName): string {
    const name = (relationshipsConfig as any)[relationshipName.toString()];
    if (name === undefined) {
      throw new Error(`relationshipConfig with property "${relationshipName}" not found`);
    }
    return name;
  }

  /**
   * TEMPORARY: TODO DELETE
   */
  public async addTestTranslationToDb(): Promise<void> {
    const translationFeatureLayer = new FeatureLayer({
      url: 'https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer',
      layerId: 17
    });
    await translationFeatureLayer.load();

    // clear table
    const where = '1=1';
    const outFields = ['OBJECTID'];
    const deleteFeatures = await this.queryService.where(translationFeatureLayer, where, outFields);
    if (deleteFeatures.length > 0) {
      const deleteProperties: __esri.FeatureLayerApplyEditsEdits = {};
      deleteProperties.deleteFeatures = deleteFeatures;
      await this.applyEdits(translationFeatureLayer, deleteProperties);
      console.log(`table uebersetzung cleaned`);
    }

    // create translation features
    const addProperties: __esri.FeatureLayerApplyEditsEdits = {};
    addProperties.addFeatures = [];

    const result = await this.queryService.request('https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer/layers');
    const allLayers = result.data.layers.concat(result.data.tables);
    const domainNames: string[] = [];
    allLayers.forEach((layer: any) => {
      if (layer.name !== 'FIDA_UEBERSETZUNG' && layer.name !== 'FIDA_NIVLINIEN') {
        layer.fields.forEach((field: any) => {
          if (field.name !== 'OBJECTID' && field.name !== 'GLOBALID'
            && field.name !== 'CREATOR_FIELD' && field.name !== 'CREATOR_DATE_FIELD'
            && field.name !== 'LAST_EDITOR_FIELD' && field.name !== 'LAST_EDITOR_DATE_FIELD'
            && field.name !== 'FK_FIDA_LFP' && field.name !== 'FK_FIDA_HFP'
            && field.name !== 'PUNKTID_FPDS' && field.name !== 'MUTATIONID_FPDS') {

            // create row feature
            const feature1 = new Feature();
            feature1.attributes = { ...translationFeatureLayer.templates[0].prototype.attributes };
            feature1.layer = translationFeatureLayer;
            feature1.attributes.OBJEKTART = 1;
            feature1.attributes.GRUPPENAME = layer.name;
            feature1.attributes.KEY = field.name;
            feature1.attributes.VALDICT = `{"de":"${field.name}","fr":"FR:${field.name}","it":"IT:${field.name}"}`;
            addProperties.addFeatures.push(feature1);

            // create domain features
            if (field.domain != null && field.domain.codedValues != null) {
              if (domainNames.includes(field.domain.name) === false) {
                field.domain.codedValues.forEach((codeValue: any) => {
                  const feature2 = new Feature();
                  feature2.attributes = { ...translationFeatureLayer.templates[0].prototype.attributes };
                  feature2.layer = translationFeatureLayer;
                  feature2.attributes.OBJEKTART = 0;
                  feature2.attributes.GRUPPENAME = field.domain.name;
                  feature2.attributes.KEY = codeValue.code;
                  feature2.attributes.VALDICT = `{"de":"${codeValue.name}","fr":"FR:${codeValue.name}","it":"IT:${codeValue.name}"}`;
                  addProperties.addFeatures.push(feature2);
                  domainNames.push(field.domain.name);
                });
              }
            }
          }
        });
      }
    });

    await this.applyEdits(translationFeatureLayer, addProperties);
  }
}
