import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import Geometry from 'esri/geometry/Geometry';
import FeatureLayer from 'esri/layers/FeatureLayer';
import { ConfigService } from 'src/app/configs/config.service';
import { DefaultFeatureMemeory, DifferenceFeature, Differences } from 'src/app/models/Differences';
import { FeatureState, FidaFeature, RelatedFeatures } from 'src/app/models/FidaFeature.model';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { LayerService } from 'src/app/services/layer.service';
import { MessageService } from 'src/app/services/message.service';
import { QueryService } from 'src/app/services/query.service';
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
  createFeatures: FidaFeature[];
  editFeatures: FidaFeature[];
  deleteFeatures: FidaFeature[];
  defaultFeatures: FidaFeature[];
  showAll: boolean;

  constructor(
    private versionManagementService: VersionManagementService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private queryService: QueryService,
    private layerService: LayerService,
    private configService: ConfigService
  ) { }

  ngOnInit(): void {
  }

  private async fillLists(differencesSet: Differences[]): Promise<void> {
    if (!differencesSet) {
      return;
    }

    this.createFeatures = [];
    this.editFeatures = [];
    this.deleteFeatures = [];
    this.defaultFeatures = [];

    const defaultFeatureMemeories: DefaultFeatureMemeory[] = [];

    // loop ovar all root-layers
    const rootLayers = this.layerService.getLayers();

    for (const rootLayer of rootLayers) {
      // create version and default feature-layer
      const versionFeatureLayer = await this.createFeatureLayer(rootLayer as FeatureLayer, this.version.versionName);

      // find root-features in difference-lists
      const differences = differencesSet.find((f: any) => f.layerId === versionFeatureLayer.layerId);
      if (differences) {
        this.differenceFeaturesToList(differences.inserts, versionFeatureLayer, FeatureState.Create,
          this.createFeatures, differencesSet, defaultFeatureMemeories);
        this.differenceFeaturesToList(differences.updates, versionFeatureLayer, FeatureState.Edit,
          this.editFeatures, differencesSet, defaultFeatureMemeories);
        this.differenceFeaturesToList(differences.deletes, versionFeatureLayer, FeatureState.Delete,
          this.deleteFeatures, differencesSet, defaultFeatureMemeories);

        // memorise all updates because for this the default-feature will be loaded
        if (differences.updates) {
          const objectIds = differences.updates.map((m: any) => m.attributes.OBJECTID);
          this.updateDefaultFeatureMemery(defaultFeatureMemeories, versionFeatureLayer.layerId, objectIds);
        }
      }
    }

    // load default features from edited-features
    defaultFeatureMemeories.forEach(memory => {
      const url = `${this.configService.getLayerBaseUrl()}/${memory.layerId}`;
      this.queryService.url(url, memory.objectIds).then(defaultFeatures => {
        this.defaultFeatures = this.defaultFeatures.concat(defaultFeatures);
        console.log(this.defaultFeatures);
      });
    });
  }

  private differenceFeaturesToList(differenceFeatures: DifferenceFeature[], versionFeatureLayer: FeatureLayer,
    featureState: FeatureState, list: FidaFeature[],
    differencesSet: Differences[], defaultFeatureMemeories: DefaultFeatureMemeory[]): void {
    if (differenceFeatures) {

      differenceFeatures.map(differenceFeature => {
        // create root version-feature
        const versionFeature = this.createFeature(differenceFeature, versionFeatureLayer, featureState);
        versionFeature.relatedFeatures = new RelatedFeatures();

        // find related-features and add them to root-feature
        this.differenceRelatedFeaturesToRoot(differencesSet, versionFeature, defaultFeatureMemeories);
        list.push(versionFeature);
      });
    }
  }

  private loadDefaultFeatures(feature: FidaFeature): void {

  }

  private differenceRelatedFeaturesToRoot(differencesSet: Differences[], rootFeature: FidaFeature, defaultFeatureMemeories: DefaultFeatureMemeory[]): void {
    const featureLayer = rootFeature.layer as FeatureLayer;
    const relationshipsConfig = this.configService.getRelationshipsConfigs(featureLayer.id);
    const fkField = this.configService.getLayerConfigById(featureLayer.id).fkField;

    // find all related features over relationships
    Object.entries(relationshipsConfig).map(([key, value]) => {
      const relationship = featureLayer.relationships.find(f => f.name.toLowerCase() === value.toLowerCase());
      if (relationship) {

        let updatesFeatures: FidaFeature[] = [];
        let insertsFeatures: FidaFeature[] = [];
        let deletesFeatures: FidaFeature[] = [];
        const relatedDifferences = differencesSet.find(f => f.layerId === relationship.relatedTableId);
        if (relatedDifferences) {
          updatesFeatures = this.findRelatedFeatures(relatedDifferences.updates, rootFeature, fkField, FeatureState.Edit);
          insertsFeatures = this.findRelatedFeatures(relatedDifferences.inserts, rootFeature, fkField, FeatureState.Create);
          deletesFeatures = this.findRelatedFeatures(relatedDifferences.deletes, rootFeature, fkField, FeatureState.Delete);

          // memorise all updates because for this the default-feature will be loaded
          const objectIds = updatesFeatures.map(m => m.attributes.OBJECTID);
          this.updateDefaultFeatureMemery(defaultFeatureMemeories, relationship.relatedTableId, objectIds);
        }

        (rootFeature.relatedFeatures as any)[key] = updatesFeatures.concat(insertsFeatures, deletesFeatures);
      }
    });
  }

  private updateDefaultFeatureMemery(list: DefaultFeatureMemeory[], layerId: number, objectIds: number[]): void {
    if (objectIds.length > 0) {
      let memory = list.find(f => f.layerId === layerId);
      if (!memory) {
        memory = { layerId, objectIds: [] };
        list.push(memory);
      }
      memory.objectIds = memory.objectIds.concat(objectIds);
    }
  }

  private findRelatedFeatures(list: DifferenceFeature[], rootFeature: FidaFeature, fkField: string, featureState: FeatureState): FidaFeature[] {
    const relatedFeatures: FidaFeature[] = [];
    if (list && list) {
      const differenceFeatures = list.filter(f => f.attributes[fkField] === rootFeature.attributes.GLOBALID);
      differenceFeatures.forEach(differenceFeature => {
        relatedFeatures.push(this.createFeature(differenceFeature, undefined, featureState));
      });
    }
    return relatedFeatures;
  }

  private createFeature(differenceFeature: DifferenceFeature, featureLayer: FeatureLayer, featureState: FeatureState): FidaFeature {
    const fidaFeature = new FidaFeature();
    fidaFeature.attributes = { ...differenceFeature.attributes };
    fidaFeature.geometry = new Geometry(differenceFeature.geometry);
    fidaFeature.state = featureState;
    fidaFeature.layer = featureLayer;
    fidaFeature.originalAttributes = { ...fidaFeature.attributes };
    return fidaFeature;
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

  /**
   * reconcile/Post
   */
  async reconcile(version: GdbVersion): Promise<void> {
    this.showSpinner = true;
    try {
      this.version = version;
      const purgeLockResult = await this.versionManagementService.purgeLock(version);
      this.checkResult(purgeLockResult);

      // start reading
      const startReadingResult = await this.versionManagementService.startReading(version);
      this.checkResult(startReadingResult);

      // show difference
      const differencesResult = await this.versionManagementService.differences(version);
      this.checkResult(differencesResult);
      const differencesSet = differencesResult.features;
      this.fillLists(differencesSet);

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
