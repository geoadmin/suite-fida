import { TestBed } from '@angular/core/testing';

import { CookieService } from '../cookie.service';
import { CookieService as NgxCookieService } from 'ngx-cookie-service';
import Extent from '@arcgis/core/geometry/Extent';

describe('CookieService', () => {
  let service: CookieService;

  /**
   *  Stubs and Mocks
   */

  class NgxCookieServiceStub {
    private values: any = {};
    check = (name: string) => this.values[name] !== undefined;
    set = (name: string, value: any) => { this.values[name] = value; };
    get = (name: string) => this.values[name];
  }

  /**
   * Run before each test block
   */

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CookieService,
        { provide: NgxCookieService, useClass: NgxCookieServiceStub },
      ]
    });
    service = TestBed.inject(CookieService);
  });

  /**
   * Test blocks
   */

  it('constructor', () => {
    expect(service).toBeTruthy();
  });

  it('extent', () => {
    expect(service.extent).toBeUndefined();
    service.extent = new Extent({
      xmax: 1,
      xmin: 2,
      ymax: 3,
      ymin: 4,
      spatialReference: {
        wkid: 2056
      }
    });
    const returnExtent = service.extent;
    expect(returnExtent).toBeDefined();
    expect(returnExtent.xmax).toBe(1);
    expect(returnExtent.xmin).toBe(2);
    expect(returnExtent.ymax).toBe(3);
    expect(returnExtent.ymin).toBe(4);
  });

  it('gdbVersionName', () => {
    expect(service.gdbVersionName).toBeUndefined();
    service.gdbVersionName = 'VERSION_A';
    expect(service.gdbVersionName).toBe('VERSION_A');
  });

  it('language', () => {
    expect(service.language).toBeUndefined();
    service.language = 'DE';
    expect(service.language).toBe('DE');
  });
});
