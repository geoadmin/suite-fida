import { TestBed } from '@angular/core/testing';

import { DifferenceService } from '../difference.service';
import { LayerService } from '../layer.service';
import { ConfigService } from '../../configs/config.service';
import { QueryService } from '../query.service';
import { EsriDifferences } from 'src/app/models/Difference.model';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import Layer from '@arcgis/core/layers/Layer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

describe('DifferenceService', () => {
  let service: DifferenceService;
  let queryServiceSpy: jasmine.SpyObj<QueryService>;

  /**
   *  Stubs and Mocks
   */

  class ConfigServiceStub {
    getGpConfig = () => ({ getParcelInfoUrl: 'URL' });
  }

  class LayerServiceStub {
    getLayers = () => {
      const layer = new FeatureLayer({
        //source: [{ geometry: { type: 'point', x: -100, y: 38 }, attributes: { ObjectID: 1 } }],
        objectIdField: 'ObjectID',
      });
      return [layer];
    }
  }

  /**
   * Run before each test block
   */


  beforeEach(() => {
    const querySpy = jasmine.createSpyObj('QueryService', ['geoprocess']);

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

  it('convertDifferences', async () => {
    const esriDifferencesSets: EsriDifferences[] = [];
    const version = new GdbVersion();
    version.versionName = 'version_1';

    //queryServiceSpy.geoprocess.and.returnValue(Promise.resolve(geoprocessStub));

    const fidaDifferences = await service.convertDifferences(esriDifferencesSets, version);
    expect(fidaDifferences.groups.length).toBe(5);
  });
});
