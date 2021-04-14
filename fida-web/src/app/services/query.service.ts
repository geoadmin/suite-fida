import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { SettingService } from './setting.service';
import Geometry from '@arcgis/core/geometry/Geometry';
import Query from '@arcgis/core/tasks/support/Query';
import QueryTask from '@arcgis/core/tasks/QueryTask';
import RelationshipQuery from '@arcgis/core/tasks/support/RelationshipQuery';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Feature from '@arcgis/core/Graphic';
import EsriError from '@arcgis/core/core/Error';
import esriRequest from '@arcgis/core/request';
import { environment } from '../../environments/environment';
import Geoprocessor from '@arcgis/core/tasks/Geoprocessor';
import { FidaFeature } from '../models/FidaFeature.model';


@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private token: string;

  constructor(
    private messageService: MessageService,
    private settingService: SettingService
  ) { }

  public geoprocess(url: string, parameters: any): Promise<any> {
    const geoprocessorParameters: __esri.GeoprocessorProperties = {
      url
    };
    const geoprocessor = new Geoprocessor(geoprocessorParameters);

    return new Promise((resolve, reject) => {
      geoprocessor.execute(parameters)
        .then((result: any) => {
          resolve(result);
        })
        .catch((error: EsriError) => {
          this.messageService.error('Geoprocess failed.', error);
          reject(error);
        });
    });
  }

  public attachments(featureLayer: FeatureLayer, objectIds: number[]): Promise<any> {
    const query = {
      objectIds
    };

    return new Promise((resolve, reject) => {
      featureLayer.queryAttachments(query)
        .then((attachments: any) => {
          resolve(attachments);
        })
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public relatedFeatures(featureLayer: FeatureLayer, objectId: number, relationshipId: number): Promise<FidaFeature[]> {
    const query = new RelationshipQuery();
    query.objectIds = [objectId];
    query.relationshipId = relationshipId;
    query.outFields = ['*'];

    return new Promise((resolve, reject) => {
      featureLayer.queryRelatedFeatures(query)
        .then((result: any) => {
          const resultGroup = result[objectId];
          resolve(resultGroup ? this.convertToFidaFeature(resultGroup.features) : []);
        })
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public intersect(layerUrl: string, geometry: Geometry): Promise<FidaFeature[]> {
    const query = this.buildQuery(true);
    query.geometry = geometry;
    query.returnGeometry = false;
    query.spatialRelationship = 'intersects';

    const queryTask = new QueryTask();
    queryTask.url = layerUrl;

    return new Promise((resolve, reject) => {
      queryTask.execute(query)
        .then((result: any) => resolve(this.convertToFidaFeature(result.features)))
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public where(
    featureLayer: FeatureLayer, where: string, outFields?: string[],
    orderByFields?: string[], num?: number): Promise<FidaFeature[]> {
    const query = new Query();
    query.where = where;
    query.outFields = outFields ?? ['*'];
    if (orderByFields) {
      query.orderByFields = orderByFields;
    }
    if (num) {
      query.num = num;
    }

    return new Promise((resolve, reject) => {
      featureLayer.queryFeatures(query)
        .then((result: any) => resolve(this.convertToFidaFeature(result.features)))
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public whereDistinct(featureLayer: FeatureLayer, where: string, outFields: string[]): Promise<FidaFeature[]> {
    const query = new Query();
    query.where = where;
    query.outFields = outFields;
    query.returnGeometry = false;
    query.returnDistinctValues = true;

    return new Promise((resolve, reject) => {
      featureLayer.queryFeatures(query)
        .then((result: any) => resolve(this.convertToFidaFeature(result.features)))
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public feature(featureLayer: FeatureLayer, objectid: number): Promise<FidaFeature> {
    const query = new Query();
    query.where = `OBJECTID=${objectid}`;
    query.outFields = ['*'];
    query.returnGeometry = true;

    return new Promise((resolve, reject) => {
      featureLayer.queryFeatures(query)
        .then((result: any) => {
          if (result.features.length === 1) {
            const fidaFeatures = this.convertToFidaFeature(result.features);
            resolve(fidaFeatures[0]);
          } else {
            const error = new EsriError(`Invalid OBJECTID ${objectid}`);
            this.messageService.error('Query failed.', error);
            reject(error);
          }
        })
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public url(url: string, objectIds?: number[]): Promise<FidaFeature[]> {
    const query = new Query();
    query.where = objectIds != null ? `OBJECTID IN (${objectIds.join(',')})` : '1=1';
    query.outFields = ['*'];

    const queryTask = new QueryTask();
    queryTask.url = url;

    return new Promise((resolve, reject) => {
      queryTask.execute(query)
        .then((result: any) => resolve(this.convertToFidaFeature(result.features)))
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public async request(url: string, parameters?: any, withToken?: boolean, post?: boolean): Promise<any> {
    const query = parameters ?? {};
    query.f = 'json';

    // add token if needed
    if (withToken === true) {
      query.token = await this.getToken();
    }

    const options: __esri.RequestOptions = {
      query,
      responseType: 'json'
    };

    if (post === true) {
      options.method = 'post';
    }

    return new Promise((resolve, reject) => {
      esriRequest(url, options)
        .then((result) => resolve(result))
        .catch((error: EsriError) => {
          this.messageService.error('Request failed.', error);
          reject(error);
        });
    });
  }

  private buildQuery(returnGeometry: boolean, where?: string, outFields?: string[], orderByFields?: string[]): Query {
    const query = new Query();
    query.returnGeometry = returnGeometry;
    (outFields) ? query.outFields = outFields : query.outFields = ['*'];
    (where) ? query.where = where : query.where = null;
    (orderByFields) ? query.orderByFields = orderByFields : query.orderByFields = null;
    return query;
  }

  private async getToken(): Promise<string> {
    if (this.token) {
      return Promise.resolve(this.token);
    }

    // create new token
    if (!this.settingService.user) {
      throw new Error('no user found');
    }

    // get tokenServicesUrl from server info
    const serverInfoUrl = environment.arcGisServer + '/rest/info/';
    const serverInfoResult = await this.request(serverInfoUrl);

    // get token from server
    const parameters = { username: this.settingService.user.username };
    const generateTokenResult = await this.request(serverInfoResult.data.authInfo.tokenServicesUrl, parameters, false, true);
    this.token = generateTokenResult.data.token;

    return this.token;
  }

  private convertToFidaFeature(features: any): FidaFeature[] {
    return features.map((feature: Feature) => {
      const fidaFeature = feature as FidaFeature;
      fidaFeature.originalAttributes = { ...feature.attributes };
      return fidaFeature;
    });
  }
}
