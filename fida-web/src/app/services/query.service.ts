import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { MessageService } from './message.service';
import Geometry from 'esri/geometry/Geometry';
import Query from 'esri/tasks/support/Query';
import QueryTask from 'esri/tasks/QueryTask';
import RelationshipQuery from 'esri/tasks/support/RelationshipQuery'
import FeatureLayer from 'esri/layers/FeatureLayer';
import Feature from 'esri/Graphic';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  constructor(private messageService: MessageService) { }

  public relatedFeatures(featureLayer: FeatureLayer, objectIds: number[], relationshipId: number): Promise<any> {
    const query = new RelationshipQuery();
    query.objectIds = objectIds;
    query.relationshipId = relationshipId;
    query.outFields = ["*"];

    return new Promise((resolve, reject) => {
      featureLayer.queryRelatedFeatures(query)
        .then((result: any) => resolve(result))
        .catch((error: any) => {
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

    return this.execute(queryTask, query).then((result:any)=>{
      return result.features;
    });
  }

  private buildQuery(requiredGeometry: boolean, whereQuery?: string, outFields?: string[], orderByFields?: string[]): Query {
    const query = new Query();
    query.returnGeometry = requiredGeometry;
    (outFields) ? query.outFields = outFields : query.outFields = ['*'];
    (whereQuery) ? query.where = whereQuery : query.where = null;
    (orderByFields) ? query.orderByFields = orderByFields : query.orderByFields = null;
    return query;
  }

  private execute(queryTask: QueryTask, query: Query): Promise<any> {
    return new Promise((resolve, reject) => {
      queryTask.execute(query)
        .then((result: any) => resolve(result))
        .catch((error: any) => {
          this.messageService.error('Query failed.', error);
          reject(error);
        });
    });
  }

}
