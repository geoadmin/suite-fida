import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfigService } from 'src/app/configs/config.service';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';
import { CompleteState, WidgetNotifyService } from 'src/app/services/widget-notify.service';

@Component({
  selector: 'app-feature-edit',
  templateUrl: './feature-edit.component.html',
  styleUrls: ['./feature-edit.component.scss']
})
export class FeatureEditComponent implements OnInit {

  public activated = false;
  public feature: FidaFeature;
  public showSpinner: boolean;
  public maxGeometryDifference: number;
  public form: FormGroup;

  private modalRef: BsModalRef;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService,
    private modalService: BsModalService,
    private configService: ConfigService
  ) { }

  ngOnInit(): void {
    this.maxGeometryDifference = this.configService.getMaxGeometryDifference();
    this.form = new FormGroup({});

    this.widgetNotifyService.onFeatureEditSubject.subscribe(async (feature: FidaFeature) => {
      this.feature = feature;

      this.activate();

      // if creating do stuff
      if (feature.state === FeatureState.Create) {
        this.showSpinner = true;
        await Promise.all([
          this.featureService.updateGeometry(this.feature),
          this.featureService.updateLK25(this.feature),
          this.featureService.redefineGrundbuchFeatures(this.feature)
        ]);
        this.featureService.updateAttributesFromGeometry(this.feature);
        this.showSpinner = false;
      }
    });
  }

  getHeaderText(): string {
    const featureName = this.featureService.getFeatureName(this.feature);
    if (this.feature?.state === FeatureState.Create) {
      return `Create: ${featureName}`;
    } else {
      return `Edit: ${featureName}`;
    }
  }

  deleteRelatedFeatureClick(feature: FidaFeature): void {
    feature.state = FeatureState.Delete;
    this.changeDetectorRef.detectChanges();
  }

  getRelatedFeatures(relatedFeatures: FidaFeature[]): FidaFeature[] {
    return relatedFeatures?.filter(f => f.state !== FeatureState.Delete);
  }

  cancelClick(close: boolean): void {
    this.feature.attributes = { ...this.feature.originalAttributes };
    const completeState = close === true ? CompleteState.Closed : CompleteState.Canceld;
    if (this.feature.state === FeatureState.Create) {
      this.widgetNotifyService.onFeatureCreateCompleteSubject.next(completeState);
    } else {
      this.widgetNotifyService.onFeatureEditCompleteSubject.next(completeState);
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

  /**
   *  SAVE METHODS
   */

  async saveClick(saveDialogTemplate: TemplateRef<any>, largeDifferenceTemplate: TemplateRef<any>): Promise<void> {
    if (this.feature.state !== FeatureState.Create) {

      // check of max LV95E/LV95N change
      const diffLV95E = Math.abs(this.feature.attributes.LV95E - this.feature.originalAttributes.LV95E);
      const diffLV95N = Math.abs(this.feature.attributes.LV95N - this.feature.originalAttributes.LV95N);

      if (diffLV95E > this.maxGeometryDifference || diffLV95N > this.maxGeometryDifference) {
        this.modalRef = this.modalService.show(largeDifferenceTemplate, { class: 'modal-sm modal-dialog-centered' });
        return;
      }

      // check of geometry-attribute change
      const geometryFields = this.configService.getGeometryFields();
      for (const geometryField of geometryFields) {
        if (this.feature.attributes[geometryField] !== this.feature.originalAttributes[geometryField]) {
          this.modalRef = this.modalService.show(saveDialogTemplate, { class: 'modal-sm modal-dialog-centered' });
          return;
        }
      }
    }

    this.save();
  }

  saveYesClick(): void {
    this.modalRef.hide();
    this.showSpinner = true;
    this.save();
  }

  saveNoClick(): void {
    // return to edit view
    this.modalRef.hide();
  }

  async save(): Promise<void> {
    const featureState = this.feature.state;
    this.showSpinner = true;
    this.featureService.updateGeometryFromAttributes(this.feature);
    const success = await this.featureService.saveFeature(this.feature);
    this.showSpinner = false;
    this.changeDetectorRef.detectChanges();

    if (success) {
      if (featureState === FeatureState.Create) {
        this.widgetNotifyService.onFeatureCreateCompleteSubject.next(CompleteState.Saved);
      } else {
        this.widgetNotifyService.onFeatureEditCompleteSubject.next(CompleteState.Saved);
      }

      this.deactivate();
    }
  }

}
