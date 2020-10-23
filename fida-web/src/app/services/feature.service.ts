import { Injectable } from '@angular/core';
import { ConfigService } from '../configs/config.service';
import { RelationshipConfig } from '../configs/models/config.model';
import { MessageService } from './message.service';

import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import { LayersService } from './layers.service';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private layersService: LayersService,
    private queryService: QueryService
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
          this.messageService.error('Save failed.', error);
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

  public async refreshRelatedGrundbuchFeatures(feature: Feature) {
    // TODO create buffer geometry
    // query gemeinde
    const gemeindeLayerConfig = this.layersService.getQueryLayerConfig('gemeinde');
    const gemeindeUrl = gemeindeLayerConfig.properties.url;
    return this.queryService.intersect(gemeindeUrl, feature.geometry).then((features) => {
      features.forEach((feature) => {
        console.log(feature.attributes.bezirksnummer,feature.attributes.kantonsnummer,feature.attributes.name);
      })
    });
    // TODO lade land kanton bezirk und parzellen info
  }

  private querRelated(feature: Feature, relationshipConfig: RelationshipConfig) {
    const objectIds = [feature.attributes.OBJECTID];
    const relationshipId = relationshipConfig.relationshipId;
    const featureLayer = this.getFeatureLayer(feature);

    this.queryService.relatedFeatures(featureLayer, objectIds, relationshipId).then((result) => {
        // TODO
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
}
