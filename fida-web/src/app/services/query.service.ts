import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { SettingService } from './setting.service';
import Geometry from 'esri/geometry/Geometry';
import Query from 'esri/tasks/support/Query';
import QueryTask from 'esri/tasks/QueryTask';
import RelationshipQuery from 'esri/tasks/support/RelationshipQuery'
import FeatureLayer from 'esri/layers/FeatureLayer';
import Feature from 'esri/Graphic';
import EsriError from 'esri/core/Error';
import esriRequest from 'esri/request';
import { environment } from '../../environments/environment';
import Geoprocessor from 'esri/tasks/Geoprocessor';
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
      url: url
    }
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
      objectIds: objectIds
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

  public relatedFeatures(featureLayer: FeatureLayer, objectId: number, relationshipId: number): Promise<Feature[]> {
    const query = new RelationshipQuery();
    query.objectIds = [objectId];
    query.relationshipId = relationshipId;
    query.outFields = ["*"];

    return new Promise((resolve, reject) => {
      featureLayer.queryRelatedFeatures(query)
        .then((result: any) => {
          const resultGroup = result[objectId];
          resolve(resultGroup ? resultGroup.features : []);
        })
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

  public intersect(layerUrl: string, geometry: Geometry): Promise<Feature[]> {
    const query = this.buildQuery(true);
    query.geometry = geometry;
    query.spatialRelationship = 'intersects';

    const queryTask = new QueryTask();
    queryTask.url = layerUrl;

    return new Promise((resolve, reject) => {
      queryTask.execute(query)
        .then((result: any) => resolve(result.features))
        .catch((error: EsriError) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });    
  }

  public where(featureLayer: FeatureLayer, where: string): Promise<FidaFeature[]> {
    const query = new Query();
    query.where = where;
    query.outFields = ['*'];
        
    return new Promise((resolve, reject) => {
      featureLayer.queryFeatures(query)
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
      query: query,
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

  private convertToFidaFeature(features: any) : FidaFeature[]{
    return features.map((m:any) => m as FidaFeature);
  }
}
