import { Injectable, ElementRef } from '@angular/core';
import { WidgetsService } from 'src/app/services/widgets.service';
import { LayersService } from 'src/app/services/layers.service';
import { MessageService } from 'src/app/services/message.service';

import Map from 'esri/Map';
import MapView from 'esri/views/MapView';
import Extent from 'esri/geometry/Extent';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import EsriError from 'esri/core/Error';

@Injectable({ providedIn: 'root' })
export class MapService {
  private view: MapView;
  private graphicsLayer: GraphicsLayer;

  constructor(
    private widgetsService: WidgetsService,
    private layersService: LayersService,
    private messageService: MessageService
  ) { }

  public async initMap(mapContainer: ElementRef): Promise<void> {
    try {
      // create esri-map
      const basemap = await this.layersService.getBasemap();
      const layers = this.layersService.getLayers();
      const map = new Map({
        basemap: basemap,
        layers: layers
      });

      // create graphic layer for editing
      this.graphicsLayer = new GraphicsLayer({ listMode: 'hide' });
      map.layers.add(this.graphicsLayer);

      // create esri-map-view
      this.view = new MapView({
        map: map
      });

      // add widgets to map
      this.view.container = mapContainer.nativeElement;
      this.view.ui.components = ['attribution'];
      this.view.ui.add(this.widgetsService.getBasemapWidget(this.view), "bottom-left");
      this.view.ui.add(this.widgetsService.getZoomWidget(this.view), "top-left");
      this.view.ui.add(this.widgetsService.getSearchWidget(this.view), "top-right");
      this.view.ui.add(this.widgetsService.getLayerListWidget(this.view), "top-right");
      this.view.ui.add(this.widgetsService.getFeatureCreateWidget(this.view), "top-right");
      this.view.ui.add(this.widgetsService.getFeatureCreateWidget(this.view), "top-right");

      await this.view.when().then(() => {
        this.zoomToSwitzerland();
      });

      // init popup 
      this.view.popup.dockOptions.position = 'top-left'
      this.view.popup.dockEnabled = true;

    } catch (error) {
      console.error('map initialization failed', error);
      this.messageService.error('map initialization failed', error);
    }
  }

  private zoomToSwitzerland(): void {
    this.view.goTo(
      new Extent({
        xmax: 2852897,
        xmin: 2471833,
        ymax: 1320405,
        ymin: 1050244,
        spatialReference: this.view.spatialReference
      })
    );
  }

  public getMapView(): MapView {
    return this.view;
  }

  public getGraphicsLayer(): GraphicsLayer {
    return this.graphicsLayer;
  }

  public enablePopup(enable: boolean): void {
    this.view.map.layers.map((layer) => {
      let featureLayer = layer as FeatureLayer;
      if (featureLayer) {
        featureLayer.popupEnabled = enable;
      }
    });
  }
}
