import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FeatureService } from 'src/app/services/feature.service';
import Feature from 'esri/Graphic'

@Component({
  selector: 'app-feature-container',
  templateUrl: './feature-container.component.html',
  styleUrls: ['./feature-container.component.scss']
})
export class FeatureContainerComponent implements OnInit {
  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainer: ViewContainerRef;
  @ViewChild('editContainer', { read: ViewContainerRef }) editContainer: ViewContainerRef;

  public editMode: boolean = false;
  public feature: Feature

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
  }

  setFeature(feature: Feature): void {
    this.feature = feature;
    this.featureService.loadRelated(this.feature);
  }

  editClick() {
    this.setEditMode(true);
  }

  async onSave(feature: Feature) {
    await this.featureService.updateFeature(feature);
    this.setEditMode(false);
  }

  onCancle() {
    console.log("cancled")
    this.setEditMode(false);
  }

  private setEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.changeDetectorRef.detectChanges();
  }
}
