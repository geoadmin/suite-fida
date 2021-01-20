import { Injectable } from '@angular/core';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Feature from 'esri/Graphic';
import { ConfigService } from '../configs/config.service';
import { DefaultFeatureMemeory, EsriDifferenceFeature, EsriDifferences, FidaDifferenceAttribute, FidaDifferenceFeature, FidaDifferenceGroup, FidaDifferences } from '../models/Difference.model';
import { FeatureState } from '../models/FidaFeature.model';
import { GdbVersion } from '../models/GdbVersion.model';
import { LayerService } from './layer.service';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class DifferenceService {

  constructor(
    private queryService: QueryService,
    private layerService: LayerService,
    private configService: ConfigService
  ) { }

  public async convertDifferences(esriDifferencesSets: EsriDifferences[], version: GdbVersion): Promise<FidaDifferences> {
    const creates: FidaDifferenceGroup = { name: 'creates', features: [] };
    const edits: FidaDifferenceGroup = { name: 'edits', features: [] };
    const editAttributes: FidaDifferenceGroup = { name: 'edit-attributes', features: [] };
    const editGeometry: FidaDifferenceGroup = { name: 'edit-geometry', features: [] };
    const deletes: FidaDifferenceGroup = { name: 'deletes', features: [] };

    const differences = new FidaDifferences();
    differences.date = new Date();
    differences.version = version;
    differences.groups = [creates, editAttributes, editGeometry, deletes];

    if (!esriDifferencesSets) {
      return Promise.resolve(differences);
    }

    const defaultFeatureMemeories: DefaultFeatureMemeory[] = [];
    let defaultFeatures: Feature[] = [];

    // loop ovar all root-layers
    const rootLayers = this.layerService.getLayers();

    for (const rootLayer of rootLayers) {
      // create version and default feature-layer
      const versionFeatureLayer = await this.createFeatureLayer(rootLayer as FeatureLayer, version.versionName);

      // find root-features in difference-lists
      const esriFifferences = esriDifferencesSets.find((f: any) => f.layerId === versionFeatureLayer.layerId);
      if (esriFifferences) {
        this.convertDifferenceFeatures(esriFifferences.inserts, versionFeatureLayer, FeatureState.Create,
          creates, esriDifferencesSets, defaultFeatureMemeories);
        this.convertDifferenceFeatures(esriFifferences.updates, versionFeatureLayer, FeatureState.Edit,
          edits, esriDifferencesSets, defaultFeatureMemeories);
        this.convertDifferenceFeatures(esriFifferences.deletes, versionFeatureLayer, FeatureState.Delete,
          deletes, esriDifferencesSets, defaultFeatureMemeories);

        // memorise all updates because for this the default-feature will be loaded
        if (esriFifferences.updates) {
          const objectIds = esriFifferences.updates.map((m: any) => m.attributes.OBJECTID);
          this.updateDefaultFeatureMemery(defaultFeatureMemeories, versionFeatureLayer.layerId, objectIds);
        }
      }
    }

    // load default-features from edited-features
    for (const memory of defaultFeatureMemeories) {
      const url = `${this.configService.getLayerBaseUrl()}/${memory.layerId}`;
      await this.queryService.url(url, memory.objectIds).then(features => {
        defaultFeatures = defaultFeatures.concat(features);
      });
    }

    // merge the default-feature into the difference-features
    this.mergeDefaultFeatureToDifferenceFeature(edits, defaultFeatures);

    // split the edits into edits-attributes and edits-geometry
    editAttributes.features = edits.features.filter(f => this.hasAttributeChanges(f));
    editGeometry.features = edits.features.filter(f => this.hasGeometryChange(f));

    return differences;
  }

  private mergeDefaultFeatureToDifferenceFeature(group: FidaDifferenceGroup, defaultFeatures: Feature[]): void {
    group.features.forEach(differenceFeature => {
      const defaultFeature = defaultFeatures.find(f => f.attributes.GLOBALID === differenceFeature.globalId);
      this.mergeToDifferenceFeature(defaultFeature, differenceFeature);
      if (differenceFeature.relatedFeatures) {
        differenceFeature.relatedFeatures.forEach(differenceGroup => {
          differenceGroup.features.forEach(relatedDifferenceFeature => {
            const defaultRelatedFeature = defaultFeatures.find(f => f.attributes.GLOBALID === relatedDifferenceFeature.globalId);
            this.mergeToDifferenceFeature(defaultRelatedFeature, relatedDifferenceFeature);
          });
        });
      }
    });
  }

  private mergeToDifferenceFeature(feature: Feature, differenceFeature: FidaDifferenceFeature): void {
    if (feature && differenceFeature) {
      differenceFeature.attributes.forEach(differenceAttribute => {
        differenceAttribute.state = undefined;
        let defaultValue = feature.attributes[differenceAttribute.name];
        let versionValue = differenceAttribute.versionValue;
        // clean number values
        if (typeof versionValue === 'number') {
          versionValue = Math.round(versionValue * 1000000) / 1000000;
        }
        if (typeof defaultValue === 'number') {
          defaultValue = Math.round(defaultValue * 1000000) / 1000000;
        }
        if (defaultValue !== versionValue) {
          differenceAttribute.state = FeatureState.Edit;
          differenceAttribute.defaultValue = defaultValue;
        }
      });
    }
  }

  private convertDifferenceFeatures(
    esriDifferenceFeatures: EsriDifferenceFeature[], versionFeatureLayer: FeatureLayer, featureState: FeatureState,
    group: FidaDifferenceGroup, esriDifferencesSets: EsriDifferences[], defaultFeatureMemeories: DefaultFeatureMemeory[]): void {
    if (esriDifferenceFeatures) {
      const versionFeatureLayerName = this.configService.getLayerInfoById(versionFeatureLayer.layerId).name;
      esriDifferenceFeatures.map(esriDifferenceFeature => {
        // create difference-feature
        const rootDifferenceFeature = this.createDifferenceFeature(esriDifferenceFeature, featureState, versionFeatureLayerName);
        rootDifferenceFeature.relatedFeatures = [];

        // find related-difference-features and add them to root-feature
        this.convertRelatedDifferenceFeatures(esriDifferencesSets, rootDifferenceFeature, versionFeatureLayer, defaultFeatureMemeories);
        group.features.push(rootDifferenceFeature);
      });
    }
  }

  private convertRelatedDifferenceFeatures(
    esriDifferencesSets: EsriDifferences[], rootDifferenceFeature: FidaDifferenceFeature,
    versionFeatureLayer: FeatureLayer, defaultFeatureMemeories: DefaultFeatureMemeory[]): void {
    const relationshipsConfig = this.configService.getRelationshipsConfigs(versionFeatureLayer.id);
    const fkField = this.configService.getLayerConfigById(versionFeatureLayer.id).fkField;

    // find all related features over relationships
    Object.entries(relationshipsConfig).map(([key, value]) => {
      const relationship = versionFeatureLayer.relationships.find(f => f.name.toLowerCase() === value.toLowerCase());
      if (relationship) {

        let updatesFeatures: FidaDifferenceFeature[] = [];
        let insertsFeatures: FidaDifferenceFeature[] = [];
        let deletesFeatures: FidaDifferenceFeature[] = [];
        const esriRelatedDifferences = esriDifferencesSets.find(f => f.layerId === relationship.relatedTableId);
        const layerName = this.configService.getLayerInfoById(relationship.relatedTableId).name;
        if (esriRelatedDifferences) {
          updatesFeatures = this.findRelatedDifferenceFeatures(esriRelatedDifferences.updates, rootDifferenceFeature,
            fkField, FeatureState.Edit, layerName);
          insertsFeatures = this.findRelatedDifferenceFeatures(esriRelatedDifferences.inserts, rootDifferenceFeature,
            fkField, FeatureState.Create, layerName);
          deletesFeatures = this.findRelatedDifferenceFeatures(esriRelatedDifferences.deletes, rootDifferenceFeature,
            fkField, FeatureState.Delete, layerName);

          // memorise all updates because for this the default-feature will be loaded
          const objectIds = updatesFeatures.map(m => m.objectId);
          this.updateDefaultFeatureMemery(defaultFeatureMemeories, relationship.relatedTableId, objectIds);
        }

        // create related-difference-group and add it to the related-list
        rootDifferenceFeature.relatedFeatures.push({
          name: key,
          features: updatesFeatures.concat(insertsFeatures, deletesFeatures)
        });
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

  private findRelatedDifferenceFeatures(
    list: EsriDifferenceFeature[], rootDifferenceFeature: FidaDifferenceFeature, fkField: string,
    featureState: FeatureState, layerName: string): FidaDifferenceFeature[] {
    const relatedDifferenceFeatures: FidaDifferenceFeature[] = [];
    if (list && list) {
      const differenceFeatures = list.filter(f => f.attributes[fkField] === rootDifferenceFeature.globalId);
      differenceFeatures.forEach(differenceFeature => {
        relatedDifferenceFeatures.push(this.createDifferenceFeature(differenceFeature, featureState, layerName));
      });
    }
    return relatedDifferenceFeatures;
  }

  private createDifferenceFeature(
    esriDifferenceFeature: EsriDifferenceFeature, featureState: FeatureState,
    layerName: string): FidaDifferenceFeature {
    const differenceFeature = new FidaDifferenceFeature();
    differenceFeature.globalId = esriDifferenceFeature.attributes.GLOBALID;
    differenceFeature.objectId = esriDifferenceFeature.attributes.OBJECTID;
    differenceFeature.layerName = layerName;
    differenceFeature.state = featureState;
    differenceFeature.attributes = Object.entries(esriDifferenceFeature.attributes).map(([name, versionValue]) => {
      return {
        name,
        versionValue,
        state: versionValue == null ? undefined : featureState
      };
    });
    return differenceFeature;
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

  private hasGeometryChange(differenceFeature: FidaDifferenceFeature): boolean {
    return this.isAttributeChanged(differenceFeature, 'LV95E') ||
      this.isAttributeChanged(differenceFeature, 'LV95N') ||
      this.isAttributeChanged(differenceFeature, 'LN02');
  }

  private hasAttributeChanges(differenceFeature: FidaDifferenceFeature): boolean {
    const geometryAttributeNameList = ['LV95E', 'LV95N', 'LN02'];
    const databaseAttributeNameList = ['CREATOR_FIELD', 'CREATOR_DATE_FIELD', 'LAST_EDITOR_FIELD', 'LAST_EDITOR_DATE_FIELD', 'FK_FIDA_HFP', 'FK_FIDA_LFP', 'OBJECTID', 'GLOBALID', 'PUNKTID_FPDS', 'MUTATIONID_FPDS'];
    const excludeList = geometryAttributeNameList.concat(databaseAttributeNameList);
    const differenceAttributes = differenceFeature.attributes.filter(f => !excludeList.includes(f.name));
    for (const differenceAttribute of differenceAttributes) {
      if(differenceAttribute?.state === FeatureState.Edit){
        return true;
      }
    }
    // check related-features
    return differenceFeature.relatedFeatures?.length > 0;
  }

  private isAttributeChanged(differenceFeature: FidaDifferenceFeature, name: string): boolean {
    const differenceAttribute = differenceFeature.attributes.find(f => f.name === name);
    return differenceAttribute?.state === FeatureState.Edit;
  }
}
