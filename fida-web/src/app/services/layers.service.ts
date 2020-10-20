import { Injectable, ComponentFactoryResolver, Injector } from '@angular/core';
import esriConfig from 'esri/config';
import Portal from 'esri/portal/Portal';
import Basemap from 'esri/Basemap'
import Layer from 'esri/layers/Layer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import PopupTemplate from 'esri/PopupTemplate';
import { ConfigService } from '../configs/config.service';
import { TemplateService } from './template.service';
import { LayerConfig, LayerType } from '../configs/models/config.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class LayersService {
  private portal: Portal;
  private layers: Array<Layer>;


  constructor(
    private templateService: TemplateService,
    private configService: ConfigService
  ) {
    esriConfig.portalUrl = configService.getArcGisPortal();
    this.portal = new Portal();
  }

  public async getBasemap(): Promise<Basemap> {
    return await this.portal.load().then(() => {
      const basemap = this.portal.useVectorBasemaps
        ? this.portal.defaultVectorBasemap
        : this.portal.defaultBasemap;

      return basemap;
    });
  }

  public getLayers(): Array<Layer> {
    if (!this.layers) {
    
      // create layers
      this.layers = [];
      const layerConfigs = this.configService.getLayerConfigs();
      layerConfigs.forEach(layerConfig => {
        let featureLayer = this.createLayer(layerConfig);

        // add templates to layer
        // TODO find right template....
        (featureLayer as FeatureLayer).popupTemplate = this.templateService.getFeatureTemplate();

        this.layers.push(featureLayer);
      });
    }

    return this.layers;
  }

  public getEditableFeatureLayers(): FeatureLayer[] {
    // TODO filter editable layers only
    return this.getLayers().map( m => m as FeatureLayer);
  }

  private createLayer(layerConfig: LayerConfig): Layer {
    if (layerConfig.type == LayerType.FeatureLayer) {
      return new FeatureLayer(layerConfig.properties);
    } else {
      throw new Error(`LayerType [${layerConfig.type}] is not supported.`)
    }
  }
}
