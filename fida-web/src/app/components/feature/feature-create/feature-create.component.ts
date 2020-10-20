import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { LayersService } from 'src/app/services/layers.service';
import MapView from 'esri/views/MapView';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Graphic from 'esri/Graphic';
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import { TemplateService } from 'src/app/services/template.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';

@Component({
  selector: 'app-feature-create',
  templateUrl: './feature-create.component.html',
  styleUrls: ['./feature-create.component.scss']
})
export class FeatureCreateComponent implements OnInit {
  @ViewChild('featureCreate', { static: true }) private featureInfoElement: ElementRef;
  public editableLayers: FeatureLayer[] = [];
  public selectedLayer: FeatureLayer;
  public activated: boolean = false;
  public sketchViewModel: SketchViewModel
  private mapView: MapView;
  private graphicsLayer: GraphicsLayer;


  constructor(
    private widgetsService: WidgetsService,
    private mapService: MapService,
    private layerService: LayersService,
    private templateService: TemplateService,
    private widgetNotifyService: WidgetNotifyService
  ) { }

  ngOnInit(): void {
    this.widgetsService.registerFeatureCreateWidgetContent(this.featureInfoElement);
    this.editableLayers = this.layerService.getEditableFeatureLayers();
    this.selectedLayer = this.editableLayers.length > 0 ? this.editableLayers[0] : undefined;

    this.widgetNotifyService.onFeatureCreatedSubject.subscribe(() => {
      this.onCreationComplete();
    });
  }

  private startSketching() {
    // init sketching
    if (!this.sketchViewModel) {
      this.mapView = this.mapService.getMapView();
      this.graphicsLayer = this.mapService.getGraphicsLayer();
      this.sketchViewModel = new SketchViewModel({ view: this.mapView, layer: this.graphicsLayer })
    }

    this.sketchViewModel.create(this.selectedLayer.templates[0].drawingTool as any);
    this.sketchViewModel.on('create', (event) => {
      this.onSketchingComplete(event);
      this.stopSketching();
    });
  }

  private onSketchingComplete(event: any) {
    // create feature
    const feature: Graphic = event.graphic;
    feature.attributes = { ...this.selectedLayer.templates[0].prototype.attributes };
    feature.layer = this.selectedLayer;

    // send to edit-template
    feature.popupTemplate = this.templateService.getFeatureTemplate(true);
    this.mapView.popup.features = [feature];
    this.mapView.popup.visible = true;
  }

  private onCreationComplete() {
    // clear popup template
    this.mapView.popup.visible = false;
    this.mapView.popup.clear();
  }


  public activate() {
    if (this.activated || !this.selectedLayer) {
      this.activated = false;
      this.stopSketching();
    } else {
      this.activated = true;
      this.startSketching();
    }
  }
  private stopSketching(): void {
    // TODO
    this.graphicsLayer.removeAll();
  }

  public deactivate() {
    this.activated = false;
    this.stopSketching();
  }

  public isDisabled(): boolean {
    return this.editableLayers.length === 0;
  }
}
