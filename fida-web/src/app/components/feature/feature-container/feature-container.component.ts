import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FeatureService } from 'src/app/services/feature.service';
import Feature from 'esri/Graphic'
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';

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

  ngOnDestroy() {
    console.log('Items destroyed');
  }

  public setFeature(feature: Feature, featureMode: FeatureMode): void {
    this.feature = feature;
    this.setFeatureMode(featureMode);
    this.featureService.loadRelated(this.feature);
  }

  isViewMode() {
    return this.featureMode === FeatureMode.View;
  }

  editClick() {
    this.setFeatureMode(FeatureMode.Edit);
  }

  async deleteClick() {
    await this.featureService.deleteFeature(this.feature);
    this.ngOnDestroy();
  }

  async onSave(feature: Feature) {
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

  onCancle() {
    this.setFeatureMode(FeatureMode.View);
  }

  private setFeatureMode(featureMode: FeatureMode) {
    this.featureMode = featureMode;
    this.changeDetectorRef.detectChanges();
  }


}
