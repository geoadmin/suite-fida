import { Injectable } from '@angular/core';
import Geometry from 'esri/geometry/Geometry';
import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
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
    const grundbuchFeatures: FidaFeature[] = [];
    const grundbuchLayer = await this.getGrundbuchLayer();

    // TODO create buffer geometry

    // query gemeinde
    const gemeindeLayerConfig = this.configService.getLayerConfig(LayerType.QueryLayer, 'gemeinde');
    const gemeindeFeatures = await this.queryService.intersect(gemeindeLayerConfig.properties.url, geometry)

    // create grundbuch features              
    gemeindeFeatures.forEach((gemeindeFeature) => {
      let grundbuchFeature = new FidaFeature();
      grundbuchFeature.attributes = { ...grundbuchLayer.templates[0].prototype.attributes };
      grundbuchFeature.layer = grundbuchLayer;
      grundbuchFeature.attributes.GEMEINDE = gemeindeFeature.attributes.name;
      grundbuchFeature.state = FeatureState.Create;
      grundbuchFeatures.push(grundbuchFeature);
    });

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
