import { TestBed } from '@angular/core/testing';

import { DifferenceService } from '../difference.service';
import { LayerService } from '../layer.service';
import { ConfigService } from '../../configs/config.service';
import { QueryService } from '../query.service';
import { EsriDifferences } from 'src/app/models/Difference.model';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

describe('DifferenceService', () => {
  let service: DifferenceService;
  let queryServiceSpy: jasmine.SpyObj<QueryService>;

  /**
   *  Stubs and Mocks
   */

  class ConfigServiceStub {
    getLayerInfoById = () => ({ name: 'GAGA_LAYER' });
    getRelationshipsConfigs = () => ({ relation_1: 'relation_1' });
    getLayerConfigById = () => ({ fkField: 'fk_field' });
    getLayerBaseUrl = () => 'BASE_URL';
    getGeometryFields = () => ['geo_1', 'geo_2'];
    getDatabaseFields = () => ['db_1', 'db_2'];
  }

  class LayerServiceStub {
    getLayers = () => {
      const layer = new FeatureLayer({
        source: [],
        objectIdField: 'ObjectID',
        layerId: 1
      });
      return [layer];
    }
  }

  /**
   * Run before each test block
   */


  beforeEach(() => {
    const querySpy = jasmine.createSpyObj('QueryService', ['url']);

    TestBed.configureTestingModule({
      providers: [
        DifferenceService,
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: QueryService, useValue: querySpy },
        { provide: LayerService, useClass: LayerServiceStub }
      ]
    });

    service = TestBed.inject(DifferenceService);
    queryServiceSpy = TestBed.inject(QueryService) as jasmine.SpyObj<QueryService>;
  });

  it('constructor', () => {
    expect(service).toBeTruthy();
  });

  it('convertDifferences: creates', async () => {
    const esriDifferencesSets: EsriDifferences[] = [{ layerId: 1, inserts: [{ attributes: { OBJECTID: 11 } }] }];
    const version = new GdbVersion();
    version.versionName = 'version_1';

    const fidaDifferences = await service.convertDifferences(esriDifferencesSets, version);
    const creates = fidaDifferences.groups.find(f => f.name === 'creates');
    expect(fidaDifferences.groups.length).toBe(4);
    expect(creates).toBeDefined();
    expect(creates.features.length).toBe(1);
    const feature = creates.features[0];
    expect(feature).toBeDefined();
    expect(feature.state).toBe(FeatureState.Create);
    const attribute = feature.attributes.find(f => f.name === 'OBJECTID');
    expect(attribute).toBeDefined();
    expect(attribute.state).toBe(FeatureState.Create);
    expect(attribute.versionValue).toBe(11);
    expect(attribute.defaultValue).toBeUndefined();
  });

  it('convertDifferences: edit', async () => {
    const esriDifferencesSets: EsriDifferences[] = [{
      layerId: 1,
      updates: [
        { attributes: { GLOBALID: 'GID-11', OBJECTID: 11, name: 'feature 11', geo_1: 11 } },
        { attributes: { GLOBALID: 'GID-22', OBJECTID: 22, name: 'feature 22', geo_1: 22 } }
      ]
    }];
    const version = new GdbVersion();
    version.versionName = 'version_1';
    const defaultFeature11 = new FidaFeature();
    defaultFeature11.attributes = { GLOBALID: 'GID-11', OBJECTID: 11, name: 'default feature 11', geo_1: 111 };
    const defaultFeature22 = new FidaFeature();
    defaultFeature22.attributes = { GLOBALID: 'GID-22', OBJECTID: 22, name: 'default feature 22', geo_1: 22 };

    queryServiceSpy.url.and.returnValue(Promise.resolve([defaultFeature11, defaultFeature22]));
    const fidaDifferences = await service.convertDifferences(esriDifferencesSets, version);
    expect(fidaDifferences.groups.length).toBe(4);

    // check edit-attributes
    const editAttributes = fidaDifferences.groups.find(f => f.name === 'edit-attributes');
    expect(editAttributes).toBeDefined();
    expect(editAttributes.features.length).toBe(2);
    const featureAttributes = editAttributes.features.find(f => f.objectId === 22);
    expect(featureAttributes).toBeDefined();
    expect(featureAttributes.state).toBe(FeatureState.Edit);
    const attributeAttributes = featureAttributes.attributes.find(f => f.name === 'name');
    expect(attributeAttributes).toBeDefined();
    expect(attributeAttributes.state).toBe(FeatureState.Edit);
    expect(attributeAttributes.versionValue).toBe('feature 22');
    expect(attributeAttributes.defaultValue).toBe('default feature 22');

    // check edit-geometry
    const editGeometry = fidaDifferences.groups.find(f => f.name === 'edit-geometry');
    expect(editGeometry).toBeDefined();
    expect(editGeometry.features.length).toBe(1);
    const featureGeometry = editGeometry.features.find(f => f.objectId === 11);
    expect(featureGeometry).toBeDefined();
    expect(featureGeometry.state).toBe(FeatureState.Edit);
    const attributeGeometry = featureGeometry.attributes.find(f => f.name === 'geo_1');
    expect(attributeGeometry).toBeDefined();
    expect(attributeGeometry.state).toBe(FeatureState.Edit);
    expect(attributeGeometry.versionValue).toBe(11);
    expect(attributeGeometry.defaultValue).toBe(111);
  });
});
