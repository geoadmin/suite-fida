import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { ConfigService } from '../configs/config.service';
import { RelationshipConfig } from '../configs/models/config.model';
import { MessageService } from './message.service';

import Feature from 'esri/Graphic';
import RelationshipQuery from 'esri/tasks/support/RelationshipQuery';
import FeatureLayer from 'esri/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  constructor(
    private configService: ConfigService,
    private messageService: MessageService
  ) { }

  public addFeature(feature: Feature): Promise<any> {
    // TODO save related
    const applyEditProperties = {
      addFeatures: [feature]
    };
    const featureLayer = this.getFeatureLayer(feature);
    return this.applyEdits(featureLayer, applyEditProperties, 'successfully created');
  }

  public updateFeature(feature: Feature): Promise<any> {
    // TODO save related
    const applyEditProperties = {
      updateFeatures: [feature]
    };
    const featureLayer = this.getFeatureLayer(feature);
    return this.applyEdits(featureLayer, applyEditProperties, 'successfully updated');
  }

  public deleteFeature(feature: Feature): Promise<any> {
    // TODO delete related
    const applyEditProperties = {
      deleteFeatures: [feature]
    };
    const featureLayer = this.getFeatureLayer(feature);
    return this.applyEdits(featureLayer, applyEditProperties, 'successfully deleted');
  }

  private applyEdits(featureLayer: FeatureLayer, applyEditProperties: any, successMessage: string): Promise<any> {
    const applyEditResponse = new Promise((resolve, reject) => {
      featureLayer.applyEdits(applyEditProperties)
        .then((result: any) => {
          this.messageService.success(successMessage);
          resolve(result);
        })
        .catch((error: any) => {
          this.messageService.error('Save failed.', this.formatError(error));
          reject(error);
        });
    })
    return applyEditResponse;
  }

  public loadRelated(feature: Feature) {
    if (!feature.layer) {
      return;
    }
    const relationshipConfigs = this.configService.getRelationshipConfigs(feature.layer.id);

    relationshipConfigs.forEach(relationshipConfig => {
      this.querRelated(feature, relationshipConfig);
    });

  }

  private querRelated(feature: Feature, relationshipConfig: RelationshipConfig) {
    const query = new RelationshipQuery();
    query.objectIds = [feature.attributes.OBJECTID];
    query.relationshipId = relationshipConfig.relationshipId;
    query.outFields = ["*"];

    const featureLayer = this.getFeatureLayer(feature);
    featureLayer.queryRelatedFeatures(query).then((result: any) => {
      //feature[RelationshipConfig.name] = result
      // TODO
      console.log(result);
    }).catch((error) => {
      console.log(error);
    });
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

  private formatError(error: any): string {
    return error.details ? error.details.messages.join('. ') : error;
  }
}
