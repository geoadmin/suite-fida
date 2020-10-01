import { Injectable, Inject, ElementRef } from '@angular/core';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service'

import MapView from 'esri/views/MapView';
import Expand from 'esri/widgets/Expand';
import BasemapGallery from 'esri/widgets/BasemapGallery';
import Search from 'esri/widgets/Search';
import Zoom from 'esri/widgets/Zoom';
import LayerList from 'esri/widgets/LayerList';
import FeatureForm from 'esri/widgets/FeatureForm';

@Injectable({ providedIn: 'root' })
export class WidgetsService {
  private featureInfoWidget: Expand;

  constructor(private widgetNotifyService: WidgetNotifyService) {
  }

  public registerFeatureInfoContent(element: ElementRef): void {
    this.featureInfoWidget = new Expand({
      expandIconClass: "esri-icon-description",
      expandTooltip: "Expand Feature Info",
      expanded: false,
      content: element.nativeElement
    });

    this.widgetNotifyService.onShowFeatureSubject.subscribe(feature => {
      this.featureInfoWidget.expanded = true;
    });
  }

  public getFeatureInfoWidget(mapView: MapView): Expand {
    if(!this.featureInfoWidget){
      console.error('no feature-info registered.')
      return;
    }
    this.featureInfoWidget.view = mapView;
    return this.featureInfoWidget;
  }

  public getFeatureTableWidget() {

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
