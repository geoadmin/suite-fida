import { TestBed } from '@angular/core/testing';

import { ParcelInfoService } from '../parcel-info.service';
import { ConfigService } from '../../configs/config.service';
import { QueryService } from './../query.service';
import Point from '@arcgis/core/geometry/Point';
import { MessageService } from '../message.service';

describe('ParcelInfoService', () => {
  let service: ParcelInfoService;
  let queryServiceSpy: jasmine.SpyObj<QueryService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  /**
   *  Stubs and Mocks
   */

  class ConfigServiceStub {
    getGpConfig = () => ({ getParcelInfoUrl: 'URL' });
  }

  /**
   * Run before each test block
   */

  beforeEach(() => {
    const querySpy = jasmine.createSpyObj('QueryService', ['geoprocess']);
    const messageSpy = jasmine.createSpyObj('MessageService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        ParcelInfoService,
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: QueryService, useValue: querySpy },
        { provide: MessageService, useValue: messageSpy }
      ]
    });

    service = TestBed.inject(ParcelInfoService);
    queryServiceSpy = TestBed.inject(QueryService) as jasmine.SpyObj<QueryService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  /**
   * Test blocks
   */

  it('constructor', () => {
    expect(service).toBeTruthy();
  });

  it('getParcelInfo', async () => {
    const point = new Point({ x: 100, y: 200 });
    const geoprocessStub = {
      results: [{
        value: [{
          egris_egrid: '1', ParzNummer: '2800', Kanton: 'SG', BLABLA: 'blabla',
          Gemeinde: 'Wartau', BFSNummer: 3276, Bezirk: 'Werdenberg', Land: 'CH'
        }]
      }]
    };
    queryServiceSpy.geoprocess.and.returnValue(Promise.resolve(geoprocessStub));


    const parcelInfos = await service.getParcelInfo(point);
    expect(parcelInfos.length).toBe(1);
    expect(parcelInfos[0].egris_egrid).toBe('1');
    expect(parcelInfos[0].ParzNummer).toBe('2800');
    expect(parcelInfos[0].Kanton).toBe('SG');
    expect(parcelInfos[0].Gemeinde).toBe('Wartau');
    expect(parcelInfos[0].BFSNummer).toBe(3276);
    expect(parcelInfos[0].Bezirk).toBe('Werdenberg');
    expect(parcelInfos[0].Land).toBe('CH');
  });

  it('getParcelInfo: no value', async () => {
    const point = new Point({ x: 100, y: 200 });
    const geoprocessStub = { results: [{ value: [] as any[] }] };
    queryServiceSpy.geoprocess.and.returnValue(Promise.resolve(geoprocessStub));

    const parcelInfos = await service.getParcelInfo(point);
    expect(parcelInfos.length).toBe(0);
  });

  it('getParcelInfo: invalid value', async () => {
    const point = new Point({ x: 100, y: 200 });
    const geoprocessStub = { results: 'invalid' };
    queryServiceSpy.geoprocess.and.returnValue(Promise.resolve(geoprocessStub));

    const parcelInfos = await service.getParcelInfo(point);
    expect(parcelInfos).toBeUndefined();
    expect(messageServiceSpy.error.calls.count()).toBe(1);
  });
});
