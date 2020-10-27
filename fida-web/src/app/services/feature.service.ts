import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryService } from './query.service';
import { ConfigService } from '../configs/config.service';
import { RelationshipConfig } from '../models/config.model';
import { MessageService } from './message.service';
import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Relationship from 'esri/layers/support/Relationship';
import { FeatureState, FidaFeature } from '../models/FidaFeature.model';
import { GrundbuchService } from './grundbuch.service';


@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private queryService: QueryService,
    private grundbuchService: GrundbuchService
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

      // update grundbuch features
      if (featureLayer.id === "LFP" && feature.state === FeatureState.Create) {
        const grundbuchFeatures = await this.createGrundbuchFeatures(feature);
        //TODO save all
        if (grundbuchFeatures.length > 0) {

          const relatedFeatureLayer = await this.getRelatedFeatureLayer(featureLayer, 'Grundbuchlfp');          
          await this.saveRelatedFeatures(relatedFeatureLayer, grundbuchFeatures);
        }
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
    return new Promise((resolve, reject) => {
      featureLayer.applyEdits(applyEditProperties).then((result: any) => {
        resolve(result);
      }).catch((error: any) => {
        this.messageService.error('Save failed.', error);
        reject(error);
      });
    });
  }

  public async loadRelatedFeatures(feature: FidaFeature): Promise<any> {
    if (!feature.layer) {
      return;
    }
    const featureLayer = this.getFeatureLayer(feature);
    // query all related features then return
    const grundbuchRelationship = this.getRelationship(featureLayer, 'Grundbuchlfp');
    feature.grundbuchFeatures = await this.queryService.relatedFeatures(featureLayer, feature.attributes.OBJECTID, grundbuchRelationship.id);

    /*return Promise.all(featureLayer.relationships.map((relationship: Relationship) => {
      return this.queryService.relatedFeatures(featureLayer, feature.attributes.OBJECTID, relationship.id);
    })).then((result: Feature[][]) => {
      // TODO 
      return feature.grundbuchFeatures = result[0];
    });
    */
  }

  public async createGrundbuchFeatures(feature: FidaFeature): Promise<FidaFeature[]> {

    // TODO create buffer geometry
    // get grundbuch     
    const grundbuchFeatures = await this.grundbuchService.createFeature(feature.geometry);
    grundbuchFeatures.forEach(grundbuchFeature => {
      grundbuchFeature.attributes.FK_FIDA_LFP = feature.attributes.GLOBALID;
    });
    return grundbuchFeatures;
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

  private async getRelatedFeatureLayer(featureLayer: FeatureLayer, relationshipName: string): Promise<FeatureLayer> {
    const relationship = this.getRelationship(featureLayer, relationshipName);
    const relatedFeatureLayerUrl = featureLayer.url + '/' + relationship.relatedTableId;
    const relatedFeatureLayer = new FeatureLayer({
      gdbVersion: featureLayer.gdbVersion,
      url: relatedFeatureLayerUrl
    });

    await relatedFeatureLayer.load();
    return relatedFeatureLayer;
  }

  private getRelationship(featureLayer: FeatureLayer, relationshipName: string): Relationship {
    const relationship = featureLayer.relationships.find(f => f.name === relationshipName);
    if (!relationship) {
      throw new Error(`relationship "${relationshipName}" not found`);
    }
    return relationship;
  }
}
