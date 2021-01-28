import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { LayerService } from 'src/app/services/layer.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Feature from '@arcgis/core/Graphic';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Expand from '@arcgis/core/widgets/Expand';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-feature-create',
  templateUrl: './feature-create.component.html',
  styleUrls: ['./feature-create.component.scss']
})
export class FeatureCreateComponent implements OnInit, OnDestroy {
  @ViewChild('featureCreate', { static: true }) private featureCreateElement: ElementRef;

  public editableLayers: FeatureLayer[] = [];
  public selectedLayer: FeatureLayer;
  public activated = false;
  public wating = false;
  public sketchViewModel: SketchViewModel;
  private mapView: MapView;
  private graphicsLayer: GraphicsLayer;
  private feature: Feature;
  private expand: Expand;
  private expandedHandle: any;

  constructor(
    private widgetsService: WidgetsService,
    private mapService: MapService,
    private layerService: LayerService,
    private widgetNotifyService: WidgetNotifyService
  ) { }

  ngOnInit(): void {
    this.expand = this.widgetsService.registerFeatureCreateWidgetContent(this.featureCreateElement);
    this.expandedHandle = this.expand.watch('expanded', (newValue) => {
      if (newValue) {
        this.initLayers();
      } else {
        this.deactivate();
      }
    });

    this.widgetNotifyService.onGdbVersionChangedSubject.subscribe(() => {
      this.expand.collapse();
      this.resetLayers();
    });

    this.widgetNotifyService.onFeatureCreateCompleteSubject.subscribe(() => {
      this.deactivate();
    });
  }

  ngOnDestroy(): void {
    this.expandedHandle.remove();
  }

  startClick(): void {
    this.initSketch();
    this.activate();
    this.sketchViewModel.create(this.selectedLayer.templates[0].drawingTool as any);
  }

  createClick(): void {
    // create feature
    this.feature.attributes = { ...this.selectedLayer.templates[0].prototype.attributes };
    this.feature.layer = this.selectedLayer; /* wieso kommt dieses property nicht beim popup an? */
    (this.feature as any).sourceLayer = this.selectedLayer; /* sende layer über sourceLayer anstelle layer-property */

    const fidaFieature = this.feature as FidaFeature;
    fidaFieature.relatedFeatures = {};
    fidaFieature.state = FeatureState.Create;
    this.widgetNotifyService.onFeatureEditSubject.next(fidaFieature);

    this.wating = true;
  }

  closeClick(): void {
    this.deactivate();
    this.expand.collapse();
  }

  cancelClick(): void {
    this.deactivate();
  }

  private initLayers(): void {
    if (this.editableLayers.length === 0) {
      this.editableLayers = this.layerService.getEditableFeatureLayers();

      // select layer
      this.editableLayers.forEach(layer => {
        if (layer.visible === true) {
          this.selectedLayer = layer;
        }
      });
      if (!this.selectedLayer) {
        this.selectedLayer = this.editableLayers.length > 0 ? this.editableLayers[0] : undefined;
      }
    }
  }

  private resetLayers(): void {
    this.editableLayers = [];
    this.selectedLayer = undefined;
  }

  private initSketch(): void {
    if (!this.sketchViewModel) {
      this.mapView = this.mapService.getMapView();
      this.graphicsLayer = this.mapService.getGraphicsLayer();
      this.sketchViewModel = new SketchViewModel({ view: this.mapView, layer: this.graphicsLayer });

      this.sketchViewModel.on(['create', 'update'] as any, (event: any) => {
        if (event.state === 'complete') {
          // do not allow stop sketching on map click
          if (this.activated === true) {
            if (event.graphic) {
              this.feature = event.graphic;
            }
            this.sketchViewModel.update(this.feature, { tool: 'move' });
          }
        }
      });
    }
  }

  private deactivate(): void {
    this.activated = false;
    this.wating = false;
    this.feature = undefined;

    if (this.sketchViewModel) {
      this.sketchViewModel.cancel();
    }

    if (this.graphicsLayer) {
      this.graphicsLayer.removeAll();
    }
  }

  private activate(): void {
    this.activated = true;
    this.feature = undefined;
    this.wating = false;
    this.graphicsLayer.removeAll();
  }
}
