import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';
import { MapService } from 'src/app/services/map.service';
import { WidgetNotifyService } from 'src/app/services/widget-notify.service';

@Component({
  selector: 'app-feature-edit',
  templateUrl: './feature-edit.component.html',
  styleUrls: ['./feature-edit.component.scss']
})
export class FeatureEditComponent implements OnInit {
  public activated: boolean = false;
  public feature: FidaFeature;
  public showSpinner: boolean;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private mapService: MapService,
    private widgetNotifyService: WidgetNotifyService
  ) { }

  ngOnInit(): void {
    this.widgetNotifyService.onFeatureEditSubject.subscribe((feature: FidaFeature) => {
      this.feature = feature;
      this.activate();
    });
  }

  async addRelatedFeatureClick(relatedFeaturesPropertyName: string): Promise<void> {
    await this.featureService.createRelatedFeature(this.feature, relatedFeaturesPropertyName);
    this.changeDetectorRef.detectChanges();
  }

  deleteRelatedFeatureClick(feature: FidaFeature): void {
    feature.state = FeatureState.Delete;
    this.changeDetectorRef.detectChanges();
  }

  getRelatedFeatures(relatedFeatures: FidaFeature[]) {
    return relatedFeatures?.filter(f => f.state !== FeatureState.Delete);
  }

  async saveClick(): Promise<void> {
    this.showSpinner = true;
    await this.featureService.saveFeature(this.feature);
    this.showSpinner = false;

    if (this.feature.state === FeatureState.Create) {
      this.widgetNotifyService.onFeatureCreateCompleteSubject.next(true);
    } else {
      this.widgetNotifyService.onFeatureEditCompleteSubject.next(true);
    }

    this.deactivate();
  }

  cancelClick(): void {
    if (this.feature.state === FeatureState.Create) {
      this.widgetNotifyService.onFeatureCreateCompleteSubject.next(false);
    } else {
      this.widgetNotifyService.onFeatureEditCompleteSubject.next(false);
    }
    this.deactivate();
  }

  private deactivate(): void {
    this.activated = false;
    this.feature = undefined;    
  }

  private activate(): void {
    this.activated = true;
  }
}
