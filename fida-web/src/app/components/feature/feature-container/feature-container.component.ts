import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FeatureService } from 'src/app/services/feature.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Geometry from 'esri/geometry/Geometry';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

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
  public showSpinner: boolean;
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
    //return false;
    return this.featureMode === FeatureMode.View;
  }

  editClick(): void {
    this.setFeatureMode(FeatureMode.Edit);
  }

  editGeometryClick(): void {
    let subscription = this.widgetNotifyService.onGeometryEditCompleteSubject.subscribe(async (geometry: Geometry) => {
      this.startSpinner();
      subscription.unsubscribe();
      this.feature.geometry = geometry;
      await this.featureService.createGrundbuchFeatures(this.feature);
      await this.featureService.saveFeature(this.feature);
      this.stopSpinner();
    });

    this.widgetNotifyService.onGeometryEditSubject.next(this.feature.geometry);
  }

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

  async saveClick(): Promise<void> {
    this.startSpinner();
    this.changeDetectorRef.detectChanges();
    await this.featureService.saveFeature(this.feature);

    // on edit
    if (this.featureMode === FeatureMode.Edit) {
      this.setFeatureMode(FeatureMode.View);
    }

    // on create
    else if (this.featureMode == FeatureMode.Create) {
      this.widgetNotifyService.onFeatureCreatedSubject.next(true);
    }
    this.stopSpinner();
  }

  saveCancelClick(): void {
    if (this.featureMode == FeatureMode.Create) {
      this.widgetNotifyService.onFeatureCreatedSubject.next(false);
    }
    this.setFeatureMode(FeatureMode.View);
  }

  public async setFeature(feature: FidaFeature): Promise<void> {
    try {
      this.feature = feature;
      this.featureMode = feature.state === FeatureState.Create ? FeatureMode.Create : FeatureMode.View;
      this.featureService.loadRelatedFeatures(this.feature, () => { this.changeDetectorRef.detectChanges() });
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }

  private setFeatureMode(featureMode: FeatureMode): void {
    this.featureMode = featureMode;
    this.changeDetectorRef.detectChanges();
  }

  private startSpinner():void{
    this.showSpinner = true;
    this.changeDetectorRef.detectChanges();
  }

  private stopSpinner():void{
    this.showSpinner = false;
    this.changeDetectorRef.detectChanges();
  }
}
