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

  constructor() {
  }

  public getFeatureTableWidget() {

  }

  public registerFeatureCreateWidgetContent(element: ElementRef): void {
    this.featureCreateWidget = new Expand({
      expandIconClass: "esri-icon-edit",
      expandTooltip: "Create Feature",
      expanded: false,
      content: element.nativeElement
    });

    //this.widgetNotifyService.onShowFeatureSubject.subscribe(feature => {
    //  this.createWidget.expanded = true;
    //});
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
