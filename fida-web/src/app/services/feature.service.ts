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
import { FidaFeature } from '../models/FidaFeature.model';


@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
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
    return new Promise((resolve, reject) => {
      featureLayer.applyEdits(applyEditProperties).then((result: any) => {
        this.messageService.success(successMessage);
        resolve(result);
      }).catch((error: any) => {
        this.messageService.error('Save failed.', error);
        reject(error);
      });
    });
  }

  public loadRelated(feature: FidaFeature): Promise<any> {
    if (!feature.layer) {
      return;
    }
    const featureLayer = this.getFeatureLayer(feature);
    // query all related features then return
    return Promise.all(featureLayer.relationships.map((relationship: Relationship) => {
      return this.queryService.relatedFeatures(featureLayer, feature.attributes.OBJECTID, relationship.id);
    })).then((result: Feature[][]) =>{
      // TODO 
      return feature.grundbuchFeatures = result[0];
    });
  }

  public refreshRelatedGrundbuchFeatures(feature: Feature): Promise<any> {
    // TODO create buffer geometry
    // query gemeinde
    const gemeindeLayerConfig = this.configService.getQueryLayerConfig('gemeinde');
    const gemeindeUrl = gemeindeLayerConfig.properties.url;
    return this.queryService.intersect(gemeindeUrl, feature.geometry).then((features: Feature[]) => {
      features.forEach((feature) => {
        console.log(feature.attributes.bezirksnummer, feature.attributes.kantonsnummer, feature.attributes.name);
      });
      return true;
    });
    // TODO lade land kanton bezirk und parzellen info
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
