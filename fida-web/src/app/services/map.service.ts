import { Injectable, ElementRef } from '@angular/core';
import { WidgetsService } from 'src/app/services/widgets.service';
import { LayerService } from 'src/app/services/layer.service';
import { MessageService } from 'src/app/services/message.service';
import { WidgetNotifyService } from './widget-notify.service';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Extent from '@arcgis/core/geometry/Extent';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriError from '@arcgis/core/core/Error';
import ActionButton from '@arcgis/core/support/actions/ActionButton';
import { CookieService } from './cookie.service';
import { ConfigService } from '../configs/config.service';
import { FidaFeature } from '../models/FidaFeature.model';

@Injectable({ providedIn: 'root' })
export class MapService {
  private view: MapView;
  private graphicsLayer: GraphicsLayer;

  constructor(
    private widgetsService: WidgetsService,
    private widgetNotifyService: WidgetNotifyService,
    private layerService: LayerService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private configService: ConfigService
  ) {
    this.widgetNotifyService.onFeatureDeleteSubject.subscribe((feature: FidaFeature) => {
      this.removeFeatureFromPopup(feature);
    });

    // present this events for cirtular dependency eliminations
    this.widgetNotifyService.setMapPopupVisibilitySubject.subscribe((visible: boolean) => {
      this.setPopupVisibility(visible);
    });
    this.widgetNotifyService.enableMapPopupSubject.subscribe((enable: boolean) => {
      this.enablePopup(enable);
    });
  }

  public async initMap(mapContainer: ElementRef): Promise<void> {
    try {
      // create esri-map
      const basemap = await this.layerService.getBasemap();
      const map = new Map({
        basemap
      });

      // create graphic layer for editing
      this.graphicsLayer = new GraphicsLayer({ listMode: 'hide' });

      // add layers to map
      this.addLayersToMap(map);

      // create esri-map-view
      this.view = new MapView({
        map,
        extent: this.initialExtent()
      });

      // add widgets to map
      this.view.container = mapContainer.nativeElement;
      this.view.ui.components = ['attribution'];
      this.view.ui.add(this.widgetsService.getBasemapWidget(this.view), 'bottom-left');
      this.view.ui.add(this.widgetsService.getZoomWidget(this.view), 'top-left');
      this.view.ui.add(this.widgetsService.getHomeWidget(this.view, this.getDefaultExtent()), 'top-left');
      const searchWidget = this.widgetsService.getSearchWidget(this.view);
      this.view.ui.add(searchWidget, 'top-right');
      this.view.ui.add(this.widgetsService.getLayerListWidget(this.view), 'top-right');
      this.view.ui.add(this.widgetsService.getFeatureCreateWidget(this.view), 'top-right');
      this.view.ui.add(this.widgetsService.getVersionManagerWidget(this.view), 'top-right');
      // TODO find bether solution
      this.widgetsService.initTooltips();

      // init popup
      this.initPopup();

      // on gdb version changed
      this.widgetNotifyService.onGdbVersionChangedSubject.subscribe((gdbVersionName: string) => {
        this.view.map.removeAll();
        this.addLayersToMap(this.view.map);
        this.widgetsService.updateSearchWidget(searchWidget);
      });

      // listen to extent change
      this.view.watch('extent', (newValue: Extent, oldValue: Extent) => {
        if (newValue !== oldValue) {
          this.cookieService.extent = newValue;
        }
      });

    } catch (error) {
      console.error('map initialization failed', error);
      this.messageService.error('map initialization failed', error);
    }
  }

  private initialExtent(): Extent {
    const extentParams = this.cookieService.extent || this.configService.getDefaultExtentConfig();
    return new Extent(extentParams);
  }

  private getDefaultExtent(): Extent {
    const extentParams = this.configService.getDefaultExtentConfig();
    return new Extent(extentParams);
  }

  private addLayersToMap(map: Map): void {
    const layers = this.layerService.getLayers(true);
    map.addMany(layers);
    map.layers.add(this.graphicsLayer);
  }

  public getMapView(): MapView {
    return this.view;
  }

  public getGraphicsLayer(): GraphicsLayer {
    return this.graphicsLayer;
  }

  /**
   * POPUP
   */

  private initPopup(): void {
    this.view.popup.dockOptions.position = 'top-left';
    this.view.popup.dockOptions.buttonEnabled = false;
    // do not brake
    this.view.popup.dockOptions.breakpoint = {
      width: 99999,
      height: 99999
    };
    this.view.popup.dockEnabled = true;

    // add close action
    const closeAction = new ActionButton({
      title: '',
      id: 'close-action',
      className: 'esri-popup__icon esri-icon-close'
    });
    this.view.popup.actions.splice(0, 0, closeAction);
    // this.view.popup.actions.push(closeAction);

    this.view.popup.on('trigger-action', (event: any) => {
      if (event.action.id === 'close-action') {
        this.view.popup.close();
      }
    });
  }

  public enablePopup(enable: boolean): void {
    if (this.view) {
      this.view.map.layers.map((layer) => {
        const featureLayer = layer as FeatureLayer;
        if (featureLayer) {
          featureLayer.popupEnabled = enable;
        }
      });
    }
  }

  public setPopupVisibility(visible: boolean): void {
    if (this.view) {
      this.view.popup.visible = visible;
    }
  }

  private removeFeatureFromPopup(feature: FidaFeature): void {
    const features = this.view.popup.features.filter(f => f.attributes.GLOBALID !== feature.attributes.GLOBALID);
    this.view.popup.clear();
    if (features.length === 0) {
      this.view.popup.close();
    } else {
      this.view.popup.features = features;
    }
  }
}
