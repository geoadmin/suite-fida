import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FeatureService } from 'src/app/services/feature.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Geometry from 'esri/geometry/Geometry';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { MapService } from 'src/app/services/map.service';

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

  public feature: FidaFeature;
  private modalRef: BsModalRef;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService,
    private mapService: MapService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    console.log('Items destroyed');
  }

  public async setFeature(feature: FidaFeature): Promise<void> {
    try {
      this.feature = feature;
      this.featureService.loadRelatedFeatures(this.feature, () => { this.changeDetectorRef.detectChanges() });
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }

  private enablePopup(enable: boolean): void {
    this.mapService.setPopupVisibility(enable);
    this.mapService.enablePopup(enable);
    this.changeDetectorRef.detectChanges();
  }

  /**
   * feature edit
   */

  editClick(): void {
    let subscription = this.widgetNotifyService.onFeatureEditCompleteSubject.subscribe(() => {
      this.enablePopup(true);
      subscription.unsubscribe();
    });

    this.widgetNotifyService.onFeatureEditSubject.next(this.feature);
    this.enablePopup(false);
  }

  /**
   * geometry edit
   */

  editGeometryClick(): void {
    let subscription = this.widgetNotifyService.onGeometryEditCompleteSubject.subscribe(() => {
      this.enablePopup(true);
      subscription.unsubscribe();
    });

    this.widgetNotifyService.onGeometryEditSubject.next(this.feature);
    this.enablePopup(false);
  }

  /**
   * feature delete
   */

  showDeleteDialogClick(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  async deleteClick(): Promise<void> {
    this.feature.state = FeatureState.Delete;
    await this.featureService.saveFeature(this.feature);
    // TODO destroy itself...
    //this.ngOnDestroy();
    this.modalRef.hide();
  }

  deleteCancelClick(): void {
    this.modalRef.hide();
  }
}
