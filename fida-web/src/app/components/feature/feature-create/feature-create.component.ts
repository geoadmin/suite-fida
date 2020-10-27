import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { LayerService } from 'src/app/services/layer.service';
import { TemplateService } from 'src/app/services/template.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import MapView from 'esri/views/MapView';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Feature from 'esri/Graphic';
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import { FeatureState } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-feature-create',
  templateUrl: './feature-create.component.html',
  styleUrls: ['./feature-create.component.scss']
})
export class FeatureCreateComponent implements OnInit {
  @ViewChild('featureCreate', { static: true }) private featureCreateElement: ElementRef;
  public editableLayers: FeatureLayer[] = [];
  public selectedLayer: FeatureLayer;
  public activated: boolean = false;
  public wating: boolean = false;
  public sketchViewModel: SketchViewModel
  private mapView: MapView;
  private graphicsLayer: GraphicsLayer;
  private feature: Feature;

  constructor(
    private widgetsService: WidgetsService,
    private mapService: MapService,
    private layerService: LayerService,
    private templateService: TemplateService,
    private widgetNotifyService: WidgetNotifyService
  ) { }

  ngOnInit(): void {
    this.widgetsService.registerFeatureCreateWidgetContent(this.featureCreateElement);
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

    this.widgetNotifyService.onFeatureCreatedSubject.subscribe((success: boolean) => {
      this.deactivate();
    });
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
    
    // send to edit-template
    this.feature.popupTemplate = this.templateService.getFeatureTemplate(true);
    this.mapView.popup.features = [this.feature];
    this.mapView.popup.visible = true;

    this.wating = true;
  }

  cancelClick(): void {
    this.deactivate();
    this.sketchViewModel.cancel();
  }

  private initSketch(): void {
    if (!this.sketchViewModel) {
      this.mapView = this.mapService.getMapView();
      this.graphicsLayer = this.mapService.getGraphicsLayer();
      this.sketchViewModel = new SketchViewModel({ view: this.mapView, layer: this.graphicsLayer })

      this.sketchViewModel.on(['create', 'update'] as any, (event: any) => {
        if (event.state === "complete") {
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
    this.graphicsLayer.removeAll();

    this.mapView.popup.visible = false;
    this.mapService.enablePopup(true);
  }

  private activate(): void {
    this.activated = true;
    this.feature = undefined;
    this.wating = false;
    this.graphicsLayer.removeAll();

    this.mapView.popup.visible = false;
    this.mapService.enablePopup(false);
  }

}
