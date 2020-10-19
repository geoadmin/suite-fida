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

  public updateFeature(feature: Feature): Promise<any> {
    // TODO save related
    const featureLayer = this.getFeatureLayer(feature);
    const applyEditProperties = {
      updateFeatures: [feature]
    };

    const applyEditResponse = new Promise((resolve, reject) => {
      featureLayer.applyEdits(applyEditProperties)
        .then((result: any) => {
          this.messageService.success('Successfully saved.');
          resolve(result);
        })
        .catch((error: any) => {
          this.messageService.error('Save failed.', error);
          reject(error);
        });
    })
    return applyEditResponse;
  }

  public loadRelated(feature: Feature) {
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
    const featureLayer = feature.layer as FeatureLayer;
    if (!featureLayer) {
      throw new Error(`layer ${feature.layer.id} is no FeatureLayer`);
    }
    return featureLayer;
  }

}
