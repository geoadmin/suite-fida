import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import Geometry from 'esri/geometry/Geometry';
import FeatureLayer from 'esri/layers/FeatureLayer';
import { DifferenceFeature, Differences, FidaDifference } from 'src/app/models/Differences';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { FeatureService } from 'src/app/services/feature.service';
import { LayerService } from 'src/app/services/layer.service';
import { MessageService } from 'src/app/services/message.service';
import { VersionManagementService } from 'src/app/services/version-management.service';

@Component({
  selector: 'app-version-reconcile-dialog',
  templateUrl: './version-reconcile-dialog.component.html',
  styleUrls: ['./version-reconcile-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VersionReconcileDialogComponent implements OnInit {
  @Output() reconcileFinished: EventEmitter<boolean> = new EventEmitter();
  showSpinner: boolean;
  version: GdbVersion;
  differencesSet: Differences[];
  createDifferences: FidaDifference[];
  editDifferences: FidaDifference[];
  deleteDifferences: FidaDifference[];
  showAll: boolean;

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
    if (!differencesSet) {
      return;
    }

    this.createDifferences = [];
    this.editDifferences = [];
    this.deleteDifferences = [];

    // loop ovar all root-layers
    const rootLayers = this.layerService.getLayers();
    rootLayers.forEach(async rootLayer => {
      
       // create default feature-layer (gdbVersion = null)       
       const versionFeatureLayer = await this.createFeatureLayer(rootLayer as FeatureLayer, this.version.versionName);
      
      // find root-features in difference-list
      const differences = differencesSet.find((f: any) => f.layerId === versionFeatureLayer.layerId);
      if (differences) {
        this.differenceFeaturesToList(differences.inserts, versionFeatureLayer, FeatureState.Create, this.createDifferences, differencesSet);
        this.differenceFeaturesToList(differences.updates, versionFeatureLayer, FeatureState.Edit, this.editDifferences, differencesSet);
        this.differenceFeaturesToList(differences.deletes, versionFeatureLayer, FeatureState.Delete, this.deleteDifferences, differencesSet);
      }
    });
  }

  private async differenceFeaturesToList(differenceFeatures: DifferenceFeature[], featureLayer: FeatureLayer,
    featureState: FeatureState, list: FidaDifference[], differencesSet: Differences[]): Promise<void> {
    if (differenceFeatures) {
      
      // create default feature-layer (gdbVersion = null)
      const defaultFeatureLayer = await this.createFeatureLayer(featureLayer, undefined);
        
      differenceFeatures.map(async differenceFeature => {
        // create root fida-feature
        const fidaFeature = new FidaFeature();
        fidaFeature.attributes = { ...differenceFeature.attributes };
        fidaFeature.geometry = new Geometry(differenceFeature.geometry);
        fidaFeature.state = featureState;
        fidaFeature.layer = featureLayer;
        fidaFeature.originalAttributes = { ...fidaFeature.attributes };

        // create fida difference
        const fidaDifference: FidaDifference = {
          versionFeature: fidaFeature,
          defaultFeature: undefined,
        }
        list.push(fidaDifference);

        // load root-features with related-features
        // load default root feature
        await Promise.all([
          this.featureService.loadRelatedFeatures(fidaFeature),
          this.featureService.loadFeature(defaultFeatureLayer, fidaFeature.attributes.OBJECTID)
            .then(defaultFeature => fidaDifference.defaultFeature = defaultFeature),
        ]);

        // synch loaded related-fetures with difference-list
        this.syncRelatedFeaturesWithDifferences(differencesSet, fidaFeature);
      });
    }
  }

  private async V2differenceFeaturesToList(differenceFeatures: DifferenceFeature[], featureLayer: FeatureLayer,
    featureState: FeatureState, list: FidaDifference[], differencesSet: Differences[]): Promise<void> {
    if (differenceFeatures) {
      
      // create default feature-layer (gdbVersion = null)
      const defaultFeatureLayer = await this.createFeatureLayer(featureLayer, undefined);
        
      differenceFeatures.map(async differenceFeature => {
        // create root fida-feature
        const fidaFeature = new FidaFeature();
        fidaFeature.attributes = { ...differenceFeature.attributes };
        fidaFeature.geometry = new Geometry(differenceFeature.geometry);
        fidaFeature.state = featureState;
        fidaFeature.layer = featureLayer;
        fidaFeature.originalAttributes = { ...fidaFeature.attributes };

        // create fida difference
        const fidaDifference: FidaDifference = {
          versionFeature: fidaFeature,
          defaultFeature: undefined,
        }
        list.push(fidaDifference);

        // load root-features with related-features
        // load default root feature
        await Promise.all([
          this.featureService.loadRelatedFeatures(fidaFeature),
          this.featureService.loadFeature(defaultFeatureLayer, fidaFeature.attributes.OBJECTID)
            .then(defaultFeature => fidaDifference.defaultFeature = defaultFeature),
        ]);

        // synch loaded related-fetures with difference-list
        this.syncRelatedFeaturesWithDifferences(differencesSet, fidaFeature);
      });
    }
  }

  private async createFeatureLayer(templateFeatureLayer: FeatureLayer, versionName: string): Promise<FeatureLayer> {
    const featureLayer = new FeatureLayer({
      url: templateFeatureLayer.url,
      id: templateFeatureLayer.id,
      layerId: templateFeatureLayer.layerId,
      gdbVersion: versionName
    });
    await featureLayer.load();
    return featureLayer;
  }

  private syncRelatedFeaturesWithDifferences(differencesSet: Differences[], fidaFeature: FidaFeature): void {
    Object.values(fidaFeature.relatedFeatures).map(value => {
      const relatedFeatures = value as FidaFeature[];
      relatedFeatures.forEach(relatedFeature => {
        const relatedFeatureLayer = relatedFeature.layer as FeatureLayer;
        const relatedDifferences = differencesSet.find(f => f.layerId === relatedFeatureLayer.layerId);

        if (relatedDifferences == null) {
          console.log('no differences found..');
          return;
        }
        // search for id in the lits
        if (relatedDifferences.inserts &&
          relatedDifferences.inserts.find(f => f.attributes.OBJECTID === relatedFeature.attributes.OBJECTID)) {
          relatedFeature.state = FeatureState.Create;
        } else if (relatedDifferences.updates &&
          relatedDifferences.updates.find(f => f.attributes.OBJECTID === relatedFeature.attributes.OBJECTID)) {
          relatedFeature.state = FeatureState.Edit;
        } else if (relatedDifferences.deletes &&
          relatedDifferences.deletes.find(f => f.attributes.OBJECTID === relatedFeature.attributes.OBJECTID)) {
          relatedFeature.state = FeatureState.Delete;
        }
        console.log('no difference found..');

      });
    });

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
