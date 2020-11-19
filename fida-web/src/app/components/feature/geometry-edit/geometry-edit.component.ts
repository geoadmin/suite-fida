import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import MapView from 'esri/views/MapView';
import Feature from 'esri/Graphic';
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import { FeatureService } from 'src/app/services/feature.service';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-geometry-edit',
  templateUrl: './geometry-edit.component.html',
  styleUrls: ['./geometry-edit.component.scss']
})
export class GeometryEditComponent implements OnInit {
  @ViewChild('geometryEdit', { static: true }) private geometryEditElement: ElementRef;
  public activated: boolean = false;
  public sketchViewModel: SketchViewModel
  public showSpinner: boolean;
  private mapView: MapView;
  private graphicsLayer: GraphicsLayer;
  private originalFeature: FidaFeature;
  private drawingFeature: Feature;

  constructor(
    private mapService: MapService,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService
  ) { }

  ngOnInit(): void {
    this.widgetNotifyService.onGeometryEditSubject.subscribe((feature: FidaFeature) => {
      this.originalFeature = feature;
      // create a feature rapper with edit-geometry
      this.drawingFeature = new Feature({
        geometry: feature.geometry,
      });
      this.onGeometryEdit();
    });
  }

  async saveClick(): Promise<void> {
    this.originalFeature.geometry = this.drawingFeature.geometry;
    this.showSpinner = true;
    //await this.featureService.createGrundbuchFeatures(this.originalFeature);
    await this.featureService.saveFeature(this.originalFeature);
    this.showSpinner = false;
    
    this.widgetNotifyService.onGeometryEditCompleteSubject.next(true);
    this.deactivate();
  }

  cancelClick(): void {
    this.widgetNotifyService.onGeometryEditCompleteSubject.next(false);
    this.deactivate();
  }

  private onGeometryEdit(): void {
    this.initSketch();
    this.activate();
    this.sketchViewModel.update(this.drawingFeature, { tool: 'move' });
  }

  private initSketch(): void {
    if (!this.sketchViewModel) {
      this.mapView = this.mapService.getMapView();
      this.graphicsLayer = this.mapService.getGraphicsLayer();
      this.sketchViewModel = new SketchViewModel({ view: this.mapView, layer: this.graphicsLayer })

      this.sketchViewModel.on('update', (event) => {
        if (event.state === "complete") {
          // do not allow stop sketching on map click
          if (this.activated === true) {
            this.sketchViewModel.update(this.drawingFeature, { tool: 'move' });
          }
        }
      });
    }
  }

  private deactivate(): void {
    this.activated = false;
    this.originalFeature = undefined;
    this.drawingFeature = undefined;

    if (this.sketchViewModel) {
      this.sketchViewModel.cancel();
    }

    if (this.graphicsLayer) {
      this.graphicsLayer.removeAll();
    }
  }

  private activate(): void {
    this.activated = true;
    this.graphicsLayer.removeAll();
    this.graphicsLayer.add(this.drawingFeature);
  }
}
