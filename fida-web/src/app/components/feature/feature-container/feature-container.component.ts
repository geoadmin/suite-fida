import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FeatureService } from 'src/app/services/feature.service';
import Feature from 'esri/Graphic'
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Geometry from 'esri/geometry/Geometry';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

export enum FeatureMode {
  View = 'view',
  Edit = 'edit',
  Create = 'create'
}

@Component({
  selector: 'app-feature-container',
  templateUrl: './feature-container.component.html',
  styleUrls: ['./feature-container.component.scss']
})
export class FeatureContainerComponent implements OnInit, OnDestroy {
  @ViewChild('deleteModalRef', { static: true }) deleteModalRef: ElementRef;

  public feature: FidaFeature
  public featureMode: FeatureMode = FeatureMode.View
  private modalRef: BsModalRef;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    console.log('Items destroyed');
  }

  isViewMode(): boolean {
    return this.featureMode === FeatureMode.View;
  }

  editClick(): void {
    this.setFeatureMode(FeatureMode.Edit);
  }

  editGeometryClick(): void {
    let subscription = this.widgetNotifyService.onGeometryEditCompleteSubject.subscribe(async (geometry: Geometry) => {
      subscription.unsubscribe();
      this.feature.geometry = geometry;
      await this.featureService.refreshRelatedGrundbuchFeatures(this.feature);
      this.featureService.updateFeature(this.feature);
    });

    this.widgetNotifyService.onGeometryEditSubject.next(this.feature.geometry);
  }

  showDeleteDialog(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  async deleteClick(): Promise<void> {
    await this.featureService.deleteFeature(this.feature);
    // TODO destroy itself...
    //this.ngOnDestroy();
    this.modalRef.hide();
  }

  deleteCancelClick(): void {
    this.modalRef.hide();
  }

  async onSave(feature: Feature): Promise<void> {
    // on edit
    if (this.featureMode == FeatureMode.Edit) {
      await this.featureService.updateFeature(feature);
      this.setFeatureMode(FeatureMode.View);
    }

    // on create
    else if (this.featureMode == FeatureMode.Create) {
      await this.featureService.addFeature(feature);
      this.widgetNotifyService.onFeatureCreatedSubject.next(true);
    }
  }

  onCancel(): void {
    if (this.featureMode == FeatureMode.Create) {
      this.widgetNotifyService.onFeatureCreatedSubject.next(false);
    }
    this.setFeatureMode(FeatureMode.View);
  }

  public async setFeature(feature: FidaFeature, featureMode: FeatureMode): Promise<void> {
    try {
      this.feature = feature;
      this.setFeatureMode(featureMode);
      await this.featureService.loadRelated(this.feature);
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }

  private setFeatureMode(featureMode: FeatureMode): void {
    this.featureMode = featureMode;
    this.changeDetectorRef.detectChanges();
  }
}
