  import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import Geometry from 'esri/geometry/Geometry';
import Query from 'esri/tasks/support/Query';
import QueryTask from 'esri/tasks/QueryTask';
import RelationshipQuery from 'esri/tasks/support/RelationshipQuery'
import FeatureLayer from 'esri/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  constructor() { }

  public relatedFeatures(layerUrl: string, relationshipId: number, objectId: number): Observable<any> {
    const query = new RelationshipQuery();
    query.objectIds = [objectId];
    query.relationshipId = relationshipId;

    const queryTask = new QueryTask();
    queryTask.url = layerUrl;

    return this.executeRelationshipQuery(queryTask, query);
  }

  public intersect(layerUrl: string, geometry: Geometry): Observable<any> {
    const query = this.buildQuery(true);
    query.geometry = geometry;
    query.spatialRelationship = 'intersects';
    
    const queryTask = new QueryTask();
    queryTask.url = layerUrl;

    return this.execute(queryTask, query);
  }

  private buildQuery(requiredGeometry: boolean, whereQuery?: string, outFields?: string[], orderByFields?: string[]): Query {
    const query = new Query();
    query.returnGeometry = requiredGeometry;
    (outFields) ? query.outFields = outFields : query.outFields = ['*'];
    (whereQuery) ? query.where = whereQuery : query.where = null;
    (orderByFields) ? query.orderByFields = orderByFields : query.orderByFields = null;
    return query;
  }

  private execute(queryTask: QueryTask, query: Query): Observable<any> {
    const executeResponse = from(
      new Promise((resolve, reject) => {
        queryTask.execute(query)
          .then((result: any) => resolve(result))
          .catch((error) => reject({
            response: error
          }));
      })
    );
    return executeResponse;
  }

  private executeRelationshipQuery(queryTask: QueryTask, query: RelationshipQuery): Observable<any> {
    const executeResponse = from(
      new Promise((resolve, reject) => {
        queryTask.executeRelationshipQuery(query)
          .then((result: any) => resolve(result))
          .catch((error) => reject({
            response: error
          }));
      })
    );    
    return executeResponse;
  }


}
