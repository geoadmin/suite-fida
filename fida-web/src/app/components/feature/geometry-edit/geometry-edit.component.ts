import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { CompleteState, WidgetNotifyService } from 'src/app/services/widget-notify.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import MapView from '@arcgis/core/views/MapView';
import Feature from '@arcgis/core/Graphic';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { FeatureService } from 'src/app/services/feature.service';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-geometry-edit',
  templateUrl: './geometry-edit.component.html',
  styleUrls: ['./geometry-edit.component.scss']
})
export class GeometryEditComponent implements OnInit {
  @ViewChild('geometryEdit', { static: true }) private geometryEditElement: ElementRef;
  public activated = false;
  public sketchViewModel: SketchViewModel;
  public showSpinner: boolean;
  private mapView: MapView;
  private graphicsLayer: GraphicsLayer;
  private originalFeature: FidaFeature;
  private drawingFeature: Feature;
  private modalRef: BsModalRef;

  constructor(
    private mapService: MapService,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService,
    private modalService: BsModalService
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

  async saveClick(saveDialogTemplate: TemplateRef<any>): Promise<void> {
    this.modalRef = this.modalService.show(saveDialogTemplate, { class: 'modal-sm modal-dialog-centered' });

  }

  async saveYesClick(): Promise<void> {
    this.showSpinner = true;
    await this.save();
    this.modalRef.hide();
  }

  saveNoClick(): void {
    this.cancelClick(false);
    this.modalRef.hide();
  }

  async save(): Promise<void> {
    this.originalFeature.geometry = this.drawingFeature.geometry;
    this.showSpinner = true;

    await Promise.all([
      this.featureService.updateGeometry(this.originalFeature),
      this.featureService.redefineGrundbuchFeatures(this.originalFeature)
    ]);
    this.featureService.updateAttributesFromGeometry(this.originalFeature);
    const success = await this.featureService.saveFeature(this.originalFeature);
    this.showSpinner = false;

    if (success) {
      this.widgetNotifyService.onGeometryEditCompleteSubject.next(CompleteState.Saved);
      this.deactivate();
    }
  }

  cancelClick(close: boolean): void {
    this.widgetNotifyService.onGeometryEditCompleteSubject.next(close === true ? CompleteState.Closed : CompleteState.Canceld);
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
      this.sketchViewModel = new SketchViewModel({
        view: this.mapView,
        layer: this.graphicsLayer,
        pointSymbol: UtilService.getSketchPointSymbol()
      });

      this.sketchViewModel.on('update', (event) => {
        if (event.state === 'complete') {
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
