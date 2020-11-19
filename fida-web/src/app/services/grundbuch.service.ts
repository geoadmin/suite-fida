import { Injectable } from '@angular/core';
import Geometry from 'esri/geometry/Geometry';
import Point from 'esri/geometry/Point';
import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Geoprocessor from 'esri/tasks/Geoprocessor';
import { ConfigService } from '../configs/config.service';
import { LayerType } from '../models/config.model';
import { FeatureState, FidaFeature } from '../models/FidaFeature.model';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class GrundbuchService {
  private grundbuchLayer: FeatureLayer;

  constructor(
    private configService: ConfigService,
    private queryService: QueryService
  ) { }

  public async createFeature(geometry: Geometry): Promise<FidaFeature[]> {
    const grundbuchLayer = await this.getGrundbuchLayer();

    // todo check point...
    const point = (geometry as Point);
    var parameters = {
      East: point.x,
      North: point.y,
      Dist: 1
    };

    const url = 'https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/GetParzInfo/GPServer/GetParzInfo';
    const result = await this.queryService.geoprocess(url, parameters);

    result.results[0].value

    console.log(result);
    // create grundbuch features              
    // gemeindeFeatures.forEach((gemeindeFeature) => {
    //   let grundbuchFeature = new FidaFeature();
    //   grundbuchFeature.attributes = { ...grundbuchLayer.templates[0].prototype.attributes };
    //   grundbuchFeature.layer = grundbuchLayer;
    //   grundbuchFeature.attributes.GEMEINDE = gemeindeFeature.attributes.name;
    //   grundbuchFeature.state = FeatureState.Create;
    //   grundbuchFeatures.push(grundbuchFeature);
    // });
    const grundbuchFeatures: FidaFeature[] = [];
    return grundbuchFeatures;
  }

  // TODO auslagen
  private async getGrundbuchLayer(): Promise<FeatureLayer> {
    // TODO gdb-verison berücksichtigen...
    if (!this.grundbuchLayer) {
      const grundbuchLayerConfig = this.configService.getLayerConfig(LayerType.RelatedLayer, 'grundbuchlfp');
      this.grundbuchLayer = new FeatureLayer(grundbuchLayerConfig.properties);
    }

    await this.grundbuchLayer.load();
    return this.grundbuchLayer;
  }
}
