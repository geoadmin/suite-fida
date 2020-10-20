import { Injectable, ViewContainerRef, ElementRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { WidgetsService } from 'src/app/services/widgets.service';
import { LayersService } from 'src/app/services/layers.service';
import { QueryService } from 'src/app/services/query.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service'

import Map from 'esri/Map';
import MapView from 'esri/views/MapView';
import Extent from 'esri/geometry/Extent';
import GraphicsLayer from 'esri/layers/GraphicsLayer';

@Injectable({ providedIn: 'root' })
export class MapService {
  private view: MapView;
  private graphicsLayer: GraphicsLayer;

  constructor(
    private widgetsService: WidgetsService,
    private layersService: LayersService,
    private queryService: QueryService,
    private widgetNotifyService: WidgetNotifyService
  ) { }

  public async initMap(mapContainer: ElementRef): Promise<void> {
    // create esri-map
    const basemap = await this.layersService.getBasemap();
    const layers = this.layersService.getLayers();
    const map = new Map({
      basemap: basemap,
      layers: layers
    });

    // create graphic layer
    this.graphicsLayer = new GraphicsLayer();
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
    
    await this.view.when().then(() => {
      this.zoomToSwitzerland();
    });

     // init popup 
     this.view.popup.dockOptions.position = 'top-left'
     this.view.popup.dockEnabled = true;
    
    /*this.view.on('click', (event: any) => {
      this.view.hitTest(event).then((response: any) => {
        // TODO show all found features
        const feature = response.results[0].graphic;
        this.widgetNotifyService.onShowFeatureSubject.next(feature);
      });
        


      const point = this.view.toMap({ x: event.x, y: event.y });
      const toleranceInMeters: number = 300;
      const url = 'https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer/0'
      console.log('click', point);
      const extent = new Extent({
        xmin: point.x - toleranceInMeters,
        xmax: point.x + toleranceInMeters,
        ymin: point.y - toleranceInMeters,
        ymax: point.y + toleranceInMeters,
        spatialReference: this.view.spatialReference
      })

      this.queryService.intersect(url, extent).subscribe((result) => {
        if (result.features.length > 0) {
          const feature = result.features[0];
          this.widgetNotifyService.onShowFeatureSubject.next(feature);
          const objectId: number = feature.attributes.OBJECTID;
          // load relations
          this.queryService.relatedFeatures(url, 1, objectId).subscribe((result1) => {
            console.log(result1);
          });
        }
      });
    });*/
  }

  public zoomToSwitzerland(): void {
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
}
