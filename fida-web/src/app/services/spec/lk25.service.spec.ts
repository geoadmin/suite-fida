import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Lk25Service } from '../lk25.service';
import { ConfigService } from '../../configs/config.service';
import { MessageService } from './../message.service';
import Point from '@arcgis/core/geometry/Point';

describe('Lk25Service', () => {
  let service: Lk25Service;
  let httpTestingController: HttpTestingController;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  /**
   *  Stubs and Mocks
   */

  class ConfigServiceStub {
    getGpConfig = () => ({ lk25Url: 'URL' });
  }

  /**
   * Run before each test block
   */

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MessageService', ['warning', 'error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Lk25Service,
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: MessageService, useValue: spy }
      ]
    });

    service = TestBed.inject(Lk25Service);
    httpTestingController = TestBed.inject(HttpTestingController);
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  /**
   * Test blocks
   */

  it('constructor', () => {
    expect(service).toBeTruthy();
  });

  it('getTileId', () => {
    const point = new Point({ x: 100, y: 200 });
    service.getTileId(point).then(lk25 => expect(lk25).toBe(4444), fail);

    const request = httpTestingController.expectOne(() => true);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('geometry')).toBe('100,200');
    request.flush({ results: [{ attributes: { tileid: 4444 } }] });
    httpTestingController.verify();
  });

  it('getTileId: no value', () => {
    const point = new Point({ x: 100, y: 200 });
    service.getTileId(point).then(height => {
      expect(height).toBeUndefined();
      expect(messageServiceSpy.warning.calls.count()).toBe(1);
    }, fail);

    const request = httpTestingController.expectOne(() => true);
    expect(request.request.method).toBe('GET');
    request.flush({ results: [] });
    httpTestingController.verify();
  });

  it('getTileId: to many', () => {
    const point = new Point({ x: 100, y: 200 });
    service.getTileId(point).then(height => {
      expect(height).toBeUndefined();
      expect(messageServiceSpy.warning.calls.count()).toBe(1);
    }, fail);

    const request = httpTestingController.expectOne(() => true);
    expect(request.request.method).toBe('GET');
    request.flush({ results: [
      { attributes: { tileid: 4444 } },
      { attributes: { tileid: 3333 } }
    ] });
    httpTestingController.verify();
  });

  it('getTileId: error', () => {
    const point = new Point({ x: 100, y: 200 });
    service.getTileId(point).then(height => {
      expect(height).toBeUndefined();
      expect(messageServiceSpy.error.calls.count()).toBe(1);
    }, fail);

    const request = httpTestingController.expectOne(() => true);
    expect(request.request.method).toBe('GET');
    request.error(new ErrorEvent('bad request'));
    httpTestingController.verify();
  });
});
