import { Injectable, Inject, ElementRef } from '@angular/core';

import MapView from 'esri/views/MapView';
import Expand from 'esri/widgets/Expand';
import BasemapGallery from 'esri/widgets/BasemapGallery';
import Search from 'esri/widgets/Search';
import Zoom from 'esri/widgets/Zoom';
import LayerList from 'esri/widgets/LayerList';

@Injectable({ providedIn: 'root' })
export class WidgetsService {
  private featureCreateWidget: Expand;
  private versionManagerWidget: Expand;

  constructor() {
  }

  public getFeatureTableWidget() {
  }

  public registerFeatureCreateWidgetContent(element: ElementRef): Expand {
    this.featureCreateWidget = new Expand({
      expandIconClass: "esri-icon-edit",
      expandTooltip: "Create Feature",
      expanded: false,
      content: element.nativeElement
    });
    return this.featureCreateWidget;
  }

  public registerVersionManagerWidgetContent(element: ElementRef): Expand {
    this.versionManagerWidget = new Expand({
      expandIconClass: "esri-icon-collection",
      expandTooltip: "Manage Versions",
      expanded: false,
      content: element.nativeElement
    });
    return this.versionManagerWidget;
  }

  public getVersionManagerWidget(mapView: MapView): Expand {
    if(!this.versionManagerWidget){
      throw new Error('no version-manager-widget registered.');
    }

    this.versionManagerWidget.view = mapView;
    return this.versionManagerWidget;
  }

  public getFeatureCreateWidget(mapView: MapView): Expand {
    if(!this.featureCreateWidget){
      throw new Error('no feature-create-widget registered.');
    }

    this.featureCreateWidget.view = mapView;
    return this.featureCreateWidget;
  }

  public getBasemapWidget(mapView: MapView): Expand {
    var basemapGallery = new BasemapGallery({
      view: mapView
    });
    var expand = new Expand({
      view: mapView,
      content: basemapGallery
    });
    return expand;
  }

  public getSearchWidget(mapView: MapView): Expand {
    var serach = new Search({
      view: mapView
    });
    var expand = new Expand({
      expandIconClass: "esri-icon-search",
      view: mapView,
      content: serach
    });
    return expand;
  }

  public getZoomWidget(mapView: MapView): Zoom {
    var zoom = new Zoom({
      view: mapView
    });
    return zoom;
  }

  public getLayerListWidget(mapView: MapView): Expand {
    var layerList = new LayerList({
      view: mapView
    });
    var expand = new Expand({
      view: mapView,
      content: layerList
    });
    return expand;
  }

}
