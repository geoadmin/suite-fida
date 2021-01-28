import { Injectable, ElementRef } from '@angular/core';
import MapView from '@arcgis/core/views/MapView';
import Expand from '@arcgis/core/widgets/Expand';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Search from '@arcgis/core/widgets/Search';
import Zoom from '@arcgis/core/widgets/Zoom';
import LayerList from '@arcgis/core/widgets/LayerList';
import Home from '@arcgis/core/widgets/Home';
import Extent from '@arcgis/core/geometry/Extent';
import Viewpoint from '@arcgis/core/Viewpoint';
import { FidaTranslateService } from './translate.service';
import { LangChangeEvent } from '@ngx-translate/core';
import { SearchSourceService } from './search-source.service';

@Injectable({ providedIn: 'root' })
export class WidgetsService {
  private featureCreateWidget: Expand;
  private versionManagerWidget: Expand;
  private basemapGalleryWidget: Expand;
  private searchWidget: Expand;
  private layerListWidget: Expand;
  private zoomWidget: Zoom;
  private homeWidget: Home;

  constructor(
    private translateService: FidaTranslateService,
    private searchSourceService: SearchSourceService
  ) {
  }

  public registerFeatureCreateWidgetContent(element: ElementRef): Expand {
    this.featureCreateWidget = new Expand({
      expandIconClass: 'esri-icon-edit',
      expanded: false,
      content: element.nativeElement
    });
    this.synchExpandCollapse(this.featureCreateWidget);
    return this.featureCreateWidget;
  }

  public registerVersionManagerWidgetContent(element: ElementRef): Expand {
    this.versionManagerWidget = new Expand({
      expandIconClass: 'esri-icon-collection',
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
    this.basemapGalleryWidget = new Expand({
      view: mapView,
      content: basemapGallery
    });
    this.synchExpandCollapse(this.basemapGalleryWidget);
    return this.basemapGalleryWidget;
  }

  public getSearchWidget(mapView: MapView): Expand {
    const search = new Search({
      view: mapView
    });
    search.includeDefaultSources = false;

    this.refreshSearchSource(search);
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.refreshSearchSource(search);
    });

    this.searchWidget = new Expand({
      expandIconClass: 'esri-icon-search',
      view: mapView,
      content: search
    });
    this.synchExpandCollapse(this.searchWidget);
    return this.searchWidget;
  }

  public updateSearchWidget(searchWidget: Expand): void {
    const search = searchWidget.content as Search;
    this.refreshSearchSource(search);
  }

  public getZoomWidget(mapView: MapView): Zoom {
    this.zoomWidget = new Zoom({
      view: mapView
    });
    return this.zoomWidget;
  }

  public getHomeWidget(mapView: MapView, extent: Extent): Home {
    const viewPoint = new Viewpoint({
      targetGeometry: extent
    });
    this.homeWidget = new Home({
      view: mapView,
      viewpoint: viewPoint
    });
    return this.homeWidget;
  }

  public getLayerListWidget(mapView: MapView): Expand {
    const layerList = new LayerList({
      view: mapView
    });
    this.layerListWidget = new Expand({
      view: mapView,
      content: layerList
    });
    this.synchExpandCollapse(this.layerListWidget);
    return this.layerListWidget;
  }

  private synchExpandCollapse(expand: Expand): void {
    expand.collapseIconClass = expand.expandIconClass;
    expand.collapseTooltip = expand.expandTooltip;
  }

  public initTooltips(): void {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.refreshTooltips();
    });
    this.refreshTooltips();
  }

  private refreshTooltips(): void {
    this.versionManagerWidget.expandTooltip = this.translateService.translate('app.version_manager.title');
    this.featureCreateWidget.expandTooltip = this.translateService.translate('app.feature_create.title');
    this.basemapGalleryWidget.expandTooltip = this.translateService.translate('app.basemap.title');
    this.searchWidget.expandTooltip = this.translateService.translate('app.search.title');
    this.layerListWidget.expandTooltip = this.translateService.translate('app.toc.title');
    this.homeWidget.label = this.translateService.translate('app.home.title');
  }

  private refreshSearchSource(search: Search): void {
    const activeSourceIndex = search.activeSourceIndex || -1;
    search.sources.removeAll();
    search.sources.addMany(this.searchSourceService.getSearchSource());
    search.allPlaceholder = this.translateService.translate('app.search.all_placeholder');
    search.activeSourceIndex = activeSourceIndex;
  }
}
