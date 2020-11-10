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
      expandIconClass: 'esri-icon-edit',
      expandTooltip: 'Create Feature',
      expanded: false,
      content: element.nativeElement
    });
    this.synchExpandCollapse(this.featureCreateWidget);
    return this.featureCreateWidget;
  }

  public registerVersionManagerWidgetContent(element: ElementRef): Expand {
    this.versionManagerWidget = new Expand({
      expandIconClass: 'esri-icon-collection',
      expandTooltip: 'Manage Versions',
      expanded: false,
      content: element.nativeElement
    });
    this.synchExpandCollapse(this.versionManagerWidget);
    return this.versionManagerWidget;
  }

  public getVersionManagerWidget(mapView: MapView): Expand {
    if (!this.versionManagerWidget) {
      throw new Error('no version-manager-widget registered.');
    }

    this.versionManagerWidget.view = mapView;
    return this.versionManagerWidget;
  }

  public getFeatureCreateWidget(mapView: MapView): Expand {
    if (!this.featureCreateWidget) {
      throw new Error('no feature-create-widget registered.');
    }

    this.featureCreateWidget.view = mapView;
    return this.featureCreateWidget;
  }

  public getBasemapWidget(mapView: MapView): Expand {
    const basemapGallery = new BasemapGallery({
      view: mapView
    });
    const expand = new Expand({
      expandTooltip: 'Basemaps',
      view: mapView,
      content: basemapGallery
    });
    this.synchExpandCollapse(expand);
    return expand;
  }

  public getSearchWidget(mapView: MapView): Expand {
    const serach = new Search({
      view: mapView
    });
    const expand = new Expand({
      expandIconClass: 'esri-icon-search',
      expandTooltip: 'Search',
      view: mapView,
      content: serach
    });
    this.synchExpandCollapse(expand);
    return expand;
  }

  public getZoomWidget(mapView: MapView): Zoom {
    const zoom = new Zoom({
      view: mapView
    });    
    return zoom;
  }

  public getLayerListWidget(mapView: MapView): Expand {
    const layerList = new LayerList({      
      view: mapView
    });
    const expand = new Expand({
      expandTooltip: 'Layers',
      view: mapView,
      content: layerList
    });
    this.synchExpandCollapse(expand);
    return expand;
  }

  private synchExpandCollapse(expand: Expand){
    expand.collapseIconClass = expand.expandIconClass;
    expand.collapseTooltip = expand.expandTooltip;
  }

}
