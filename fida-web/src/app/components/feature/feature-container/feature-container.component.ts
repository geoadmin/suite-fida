import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FeatureService } from 'src/app/services/feature.service';
import { CompleteState, WidgetNotifyService } from 'src/app/services/widget-notify.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
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
  public feature: FidaFeature;
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

  public  setFeature(feature: FidaFeature): void {
    try {
      this.feature = feature;
      this.loadRelatedFeatures();
    } catch (error) {
      console.error(error);
    }
  }

  private enablePopup(enable: boolean): void {
    this.widgetNotifyService.setMapPopupVisibilitySubject.next(enable);
    this.widgetNotifyService.enableMapPopupSubject.next(enable);
    this.changeDetectorRef.detectChanges();
  }

  private async loadRelatedFeatures(): Promise<void>{
    this.featureService.loadRelatedFeatures(this.feature, () => { this.changeDetectorRef.detectChanges() });
    this.changeDetectorRef.detectChanges();
  }

  /**
   * feature edit
   */

  editClick(): void {
    let subscription = this.widgetNotifyService.onFeatureEditCompleteSubject.subscribe((completeState: CompleteState) => {
      this.enablePopup(true);
      subscription.unsubscribe();
      if (completeState === CompleteState.Closed) {
        this.widgetNotifyService.setMapPopupVisibilitySubject.next(false);
      } else {
        this.loadRelatedFeatures();
      }      
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

  getFeatureName(): string {
    return this.featureService.getFeatureName(this.feature);
  }

  showDeleteDialogClick(deleteDialogTemplate: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(deleteDialogTemplate, { class: 'modal-sm' });
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
