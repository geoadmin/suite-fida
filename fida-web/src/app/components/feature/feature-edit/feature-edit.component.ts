import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ɵangular_packages_platform_browser_animations_animations_f } from '@angular/platform-browser/animations';
import { ConfigService } from 'src/app/configs/config.service';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';
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
  public form: FormGroup;

  private idField: string;
  private originalAttributes: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService,
    private configService: ConfigService    
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({});

    this.widgetNotifyService.onFeatureEditSubject.subscribe((feature: FidaFeature) => {
      this.feature = feature;
      this.originalAttributes = { ...feature.attributes};
      this.idField = this.configService.getLayerConfigById(this.feature.layer.id).idField;
      this.activate();
    });
  }

  getHeaderText():string {
    if(this.feature?.state === FeatureState.Create){
      return `Create: ${this.feature?.layer.id}`;
    } else {
      const id = this.feature?.attributes[this.idField];
      return `Edit: ${this.feature?.layer.id}-${id}`;
    }    
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
    this.feature.attributes = this.originalAttributes;
    if (this.feature.state === FeatureState.Create) {
      this.widgetNotifyService.onFeatureCreateCompleteSubject.next(false);
    } else {
      this.widgetNotifyService.onFeatureEditCompleteSubject.next(false);
    }
    this.deactivate();
  }

  validateClick(featureForm: any){
    featureForm.valid;
  }

  private deactivate(): void {
    this.activated = false;
    this.feature = undefined;  
    this.originalAttributes = undefined;  
  }

  private activate(): void {
    this.activated = true;
  }
}
