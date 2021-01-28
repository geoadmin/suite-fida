import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HeightService } from '../height.service';
import { ConfigService } from '../../configs/config.service';
import { MessageService } from './../message.service';
import Point from '@arcgis/core/geometry/Point';

describe('HeightService', () => {
  let service: HeightService;
  let httpTestingController: HttpTestingController;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  /**
   *  Stubs and Mocks
   */

  class ConfigServiceStub {
    getGpConfig = () => ({ getHeightUrl: 'URL' });
  }

  /**
   * Run before each test block
   */

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MessageService', ['warning']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HeightService,
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: MessageService, useValue: spy }
      ]
    });

    service = TestBed.inject(HeightService);
    httpTestingController = TestBed.inject(HttpTestingController);
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  /**
   * Test blocks
   */

  it('constructor', () => {
    expect(service).toBeTruthy();
  });

  it('getHeight', () => {
    const point = new Point({ x: 100, y: 200 });
    service.getHeight(point).then(height => expect(height).toBe(1090.6), fail);

    const request = httpTestingController.expectOne('URL?easting=100&northing=200');
    expect(request.request.method).toBe('GET');
    request.flush({ height: '1090.6' });
    httpTestingController.verify();
  });

  it('getHeight: no value', () => {
    const point = new Point({ x: 100, y: 200 });
    service.getHeight(point).then(height => {
      expect(height).toBeUndefined();
      expect(messageServiceSpy.warning.calls.count()).toBe(1);
    }, fail);

    const request = httpTestingController.expectOne('URL?easting=100&northing=200');
    expect(request.request.method).toBe('GET');
    request.error(new ErrorEvent('bad request'));
    httpTestingController.verify();
  });
});
