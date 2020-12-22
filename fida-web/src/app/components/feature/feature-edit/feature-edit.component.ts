import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FeatureState, FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
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
  public form: FormGroup;

  private modalRef: BsModalRef;
  private originalAttributes: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private widgetNotifyService: WidgetNotifyService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({});

    this.widgetNotifyService.onFeatureEditSubject.subscribe(async (feature: FidaFeature) => {
      this.feature = feature;
      this.originalAttributes = { ...feature.attributes };

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
    this.feature.attributes = this.originalAttributes;
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
    this.originalAttributes = undefined;
  }

  private activate(): void {
    this.activated = true;
  }

  /**
   *  SAVE METHODS
   */

  async saveClick(saveDialogTemplate: TemplateRef<any>): Promise<void> {
    if (this.feature.state !== FeatureState.Create) {

      // check of geometry-attribute change
      if (this.feature.attributes.LV95E !== this.originalAttributes.LV95E
        || this.feature.attributes.LV95N !== this.originalAttributes.LV95N
        || this.feature.attributes.LN02 !== this.originalAttributes.LN02) {
        this.modalRef = this.modalService.show(saveDialogTemplate, { class: 'modal-sm' });
        return;
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
