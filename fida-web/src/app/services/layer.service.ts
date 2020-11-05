import { Injectable, ComponentFactoryResolver, Injector } from '@angular/core';
import { ConfigService } from '../configs/config.service';
import { TemplateService } from './template.service';
import { LayerConfig, LayerType } from '../models/config.model';
import esriConfig from 'esri/config';
import Portal from 'esri/portal/Portal';
import Basemap from 'esri/Basemap'
import Layer from 'esri/layers/Layer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import { SettingService } from './setting.service';


@Injectable({ providedIn: 'root' })
export class LayerService {
  private portal: Portal;
  private layers: Array<Layer>;

  constructor(
    private templateService: TemplateService,
    private configService: ConfigService,
    private settingService: SettingService
  ) {
    esriConfig.portalUrl = configService.getArcGisPortal();
    this.portal = new Portal();
    this.setUser();
  }

  public async getBasemap(): Promise<Basemap> {
    return await this.portal.load().then(() => {
      const basemap = this.portal.useVectorBasemaps
        ? this.portal.defaultVectorBasemap
        : this.portal.defaultBasemap;

      return basemap;
    });
  }

  public getLayers(reload?: boolean): Array<Layer> {
    if (!this.layers || reload === true) {
      this.createLayers();
    }

    return this.layers;
  }

  public getEditableFeatureLayers(): FeatureLayer[] {
    // TODO filter editable layers only
    return this.getLayers().map(m => m as FeatureLayer);
  }

  private createLayers() {
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

  private createLayer(layerConfig: LayerConfig): Layer {
    if (layerConfig.type == LayerType.FeatureLayer || layerConfig.type == LayerType.RelatedLayer) {
      // set the active gdb version
      layerConfig.properties.gdbVersion = this.settingService.getGdbVersionName();
      return new FeatureLayer(layerConfig.properties);
    } else {
      throw new Error(`LayerType [${layerConfig.type}] is not supported.`)
    }
  }

  private setUser(): void {
    this.portal.load().then(() => {
      this.settingService.user = this.portal.user;
    });
  }

}