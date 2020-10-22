import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FeatureService } from 'src/app/services/feature.service';
import Feature from 'esri/Graphic'
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';
import { MapService } from 'src/app/services/map.service';
import Geometry from 'esri/geometry/Geometry';

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
  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainer: ViewContainerRef;
  @ViewChild('editContainer', { read: ViewContainerRef }) editContainer: ViewContainerRef;

  public feature: Feature
  public featureMode: FeatureMode = FeatureMode.View

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService
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
    let onGeometryEditCompleteSubscription = this.widgetNotifyService.onGeometryEditCompleteSubject.subscribe((geometry: Geometry) => {
      onGeometryEditCompleteSubscription.unsubscribe();
      this.feature.geometry = geometry;
      this.featureService.updateFeature(this.feature);
    });
    
    this.widgetNotifyService.onGeometryEditSubject.next(this.feature.geometry);
  }

  async deleteClick(): Promise<void> {
    await this.featureService.deleteFeature(this.feature);
    // TODO destroy itself...
    //this.ngOnDestroy();
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
      this.widgetNotifyService.onFeatureCreatedSubject.next();
    }
  }

  onCancel(): void {
    this.setFeatureMode(FeatureMode.View);
  }

  public setFeature(feature: Feature, featureMode: FeatureMode): void {
    this.feature = feature;
    this.setFeatureMode(featureMode);
    this.featureService.loadRelated(this.feature);
  }
  
  private setFeatureMode(featureMode: FeatureMode): void {
    this.featureMode = featureMode;
    this.changeDetectorRef.detectChanges();
  }


}
