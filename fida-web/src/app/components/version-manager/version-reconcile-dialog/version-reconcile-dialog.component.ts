import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Feature from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import { ConfigService } from 'src/app/configs/config.service';
import { DifferenceFeature, Differences } from 'src/app/models/Differences';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { FeatureService } from 'src/app/services/feature.service';
import { LayerService } from 'src/app/services/layer.service';
import { MapService } from 'src/app/services/map.service';
import { MessageService } from 'src/app/services/message.service';
import { QueryService } from 'src/app/services/query.service';
import { VersionManagementService } from 'src/app/services/version-management.service';

@Component({
  selector: 'app-version-reconcile-dialog',
  templateUrl: './version-reconcile-dialog.component.html',
  styleUrls: ['./version-reconcile-dialog.component.scss']
})
export class VersionReconcileDialogComponent implements OnInit {
  @Output() reconcileFinished: EventEmitter<boolean> = new EventEmitter();
  showSpinner: boolean;
  version: GdbVersion;
  differencesSet: Differences[];
  createdFeatures: FidaFeature[];
  editedFeatures: FidaFeature[];
  deletedFeatures: FidaFeature[];

  constructor(
    private versionManagementService: VersionManagementService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService,
    private layerService: LayerService
  ) { }

  ngOnInit(): void {
  }

  private fillLists(differencesSet: Differences[]): void {

    // 2. load root-features with related-features
    // 3. eliminate loaded features from difference-list
    // 4. find root-features form remaining features and load it with related-features

    this.createdFeatures = [];
    this.editedFeatures = [];
    this.deletedFeatures = [];

    // loop ovar all root-layers
    const rootLayers = this.layerService.getLayers();
    rootLayers.forEach(rootLayer => {
      // 1. find root-features in difference-list
      const featureLayer = (rootLayer as FeatureLayer);
      const differences = differencesSet.find((f: any) => f.layerId === featureLayer.layerId);
      if (differences) {
        this.differenceFeaturesToList(differences.inserts, featureLayer, FeatureState.Create, this.createdFeatures);
        this.differenceFeaturesToList(differences.updates, featureLayer, FeatureState.Edit, this.editedFeatures);
        this.differenceFeaturesToList(differences.deletes, featureLayer, FeatureState.Delete, this.deletedFeatures);
      }
    });
  }

  private differenceFeaturesToList(differenceFeatures: DifferenceFeature[], featureLayer: FeatureLayer,
    featureState: FeatureState, list: FidaFeature[]): void {
    if (differenceFeatures) {
      differenceFeatures.map(differenceFeature => {
        const fidaFeature = new FidaFeature();
        fidaFeature.attributes = { ...differenceFeature.attributes };
        fidaFeature.geometry = differenceFeature.geometry;
        fidaFeature.state = featureState;
        fidaFeature.layer = featureLayer;
        this.featureService.loadRelatedFeatures(fidaFeature);
        list.push(fidaFeature);
      });
    }
  }

  /**
   * reconcile/Post
   */
  async reconcile(version: GdbVersion): Promise<void> {
    this.showSpinner = true;
    try {
      this.differencesSet = undefined;
      this.version = version;
      const purgeLockResult = await this.versionManagementService.purgeLock(version);
      this.checkResult(purgeLockResult);

      // start reading
      const startReadingResult = await this.versionManagementService.startReading(version);
      this.checkResult(startReadingResult);

      // show difference
      const differencesResult = await this.versionManagementService.differences(version);
      this.checkResult(differencesResult);
      this.differencesSet = differencesResult.features;
      this.fillLists(this.differencesSet);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }


  private checkResult(result: any): void {
    if (result.success === false) {
      throw result.error;
    }
  }

  async cancelClick(): Promise<void> {
    this.showSpinner = true;
    try {
      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);
      this.reconcileFinished.next(false);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }

  async declineDifferencesClick(): Promise<void> {
    this.showSpinner = true;
    try {
      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);
      this.reconcileFinished.next(false);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }

  async acceptDifferencesClick(): Promise<void> {
    this.showSpinner = true;
    try {
      // start editing
      const startEditingResult = await this.versionManagementService.startEditing(this.version);
      this.checkResult(startEditingResult);

      // reconcile post
      const reconcileResult = await this.versionManagementService.reconcile(this.version);
      this.checkResult(reconcileResult);

      // stop editing
      const stopEditingResult = await this.versionManagementService.stopEditing(this.version);
      this.checkResult(stopEditingResult);

      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);

      this.messageService.success('Reconsile/Post was successfull');
      this.reconcileFinished.next(true);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }
}
