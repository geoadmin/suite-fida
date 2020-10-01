import { Injectable } from '@angular/core';
import esriConfig from 'esri/config';
import Portal from 'esri/portal/Portal';
import Basemap from 'esri/Basemap'
import Layer from 'esri/layers/Layer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import WMTSLayer from 'esri/layers/WMTSLayer'
import MapImageLayer from 'esri/layers/MapImageLayer'



@Injectable({ providedIn: 'root' })
export class LayersService {
  private portal: Portal;
  private layers: Array<Layer>;

  constructor() {
    esriConfig.portalUrl = "https://s7t4530a.adr.admin.ch/arcgis/";
    this.portal = new Portal();
  }

  public async getBasemap(): Promise<Basemap> {
    return await this.portal.load().then(() => {
      console.log('portal loaded...');

      const basemap = this.portal.useVectorBasemaps
        ? this.portal.defaultVectorBasemap
        : this.portal.defaultBasemap;

      return basemap;
    });
  }

  public getLayers(): Array<Layer> {
    // create layers if not exists
    if (!this.layers) {
      this.layers = [
        new FeatureLayer({
          id: "LSN",
          gdbVersion: "SDE.DEFAULT",
          url: "https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer/2",
          visible: false,
          outFields: ['*']
        }),
        new FeatureLayer({
          id: "HFP",
          gdbVersion: "SDE.DEFAULT",
          url: "https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer/1",
          visible: false,
          outFields: ['*']
        }),
        new FeatureLayer({
          id: "LFP",
          gdbVersion: "SDE.DEFAULT",
          url: "https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer/0",
          visible: true,
          outFields: ['*']
        })
      ]
    }

    /*var mapInagelayer = new MapImageLayer({
      url: "https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/MapServer",
      sublayers: [
        { id: 0, title: 'LFP' },
        { id: 1, title: 'HFP', visible: false },
        { id: 2, title: 'LSN', visible: false },
        { id: 3, title: 'Nivlinien', visible: false }
      ]
    });*/
    return this.layers;
  }

  public getFatureLayer(id: string): FeatureLayer {
    // TODO:
    return null;
  }
}
