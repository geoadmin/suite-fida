import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import MapView from 'esri/views/MapView';
import Feature from 'esri/Graphic';
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Geometry from 'esri/geometry/Geometry';

@Component({
  selector: 'app-geometry-edit',
  templateUrl: './geometry-edit.component.html',
  styleUrls: ['./geometry-edit.component.scss']
})
export class GeometryEditComponent implements OnInit {
  @ViewChild('geometryEdit', { static: true }) private geometryEditElement: ElementRef;
  public activated: boolean = false;
  public sketchViewModel: SketchViewModel
  private mapView: MapView;
  private graphicsLayer: GraphicsLayer;
  private feature: Feature;

  constructor(
    private mapService: MapService,
    private widgetNotifyService: WidgetNotifyService
  ) { }

  ngOnInit(): void {
    this.widgetNotifyService.onGeometryEditSubject.subscribe((geometry: Geometry) => {
      // create a feature rapper with edit-geometry
      this.feature = new Feature({
        geometry: geometry,
      });
      this.onGeometryEdit();
    });
  }

  saveClick(): void {
    this.widgetNotifyService.onGeometryEditCompleteSubject.next(this.feature.geometry);
    this.deactivate();
  }

  cancelClick(): void {
    this.deactivate();
  }

  closeClick(): void {
    this.deactivate();
  }

  private onGeometryEdit(): void {
    this.initSketch();
    this.activate();
    this.sketchViewModel.update(this.feature, { tool: 'move' });
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
            this.sketchViewModel.update(this.feature, { tool: 'move' });
          }
        }
      });
    }
  }

  private deactivate(): void {
    this.activated = false;
    this.feature = undefined;

    if (this.sketchViewModel) {
      this.sketchViewModel.cancel();
    }

    if (this.graphicsLayer) {
      this.graphicsLayer.removeAll();
    }

    if (this.mapView) {
      this.mapView.popup.visible = true;
      this.mapView.ui.remove(this.geometryEditElement.nativeElement);
      this.mapService.enablePopup(true);
    }
  }

  private activate(): void {
    this.activated = true;
    this.graphicsLayer.removeAll();
    this.graphicsLayer.add(this.feature);

    this.mapView.popup.visible = false;
    this.mapView.ui.add(this.geometryEditElement.nativeElement, "top-right");
    this.mapService.enablePopup(false);
  }
}
