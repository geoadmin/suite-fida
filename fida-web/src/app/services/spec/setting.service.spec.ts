import { TestBed } from '@angular/core/testing';

import { SettingService } from '../setting.service';
import { ConfigService } from '../../configs/config.service';
import { CookieService } from './../cookie.service';
import { WidgetNotifyService } from './../widget-notify.service';
import { Subject } from 'rxjs';

describe('SettingService', () => {
  let service: SettingService;

  /**
   *  Stubs and Mocks
   */

  class ConfigServiceStub {
    getDefaultVersionName = () => 'DEFAULT';
  }

  class CookieServiceStub {
    gdbVersionName = 'VESION_1';
  }

  class WidgetNotifyServiceStub {
    onGdbVersionChangedSubject = new Subject();
  }

  /**
   * Run before each test block
   */

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingService,
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: CookieService, useClass: CookieServiceStub },
        { provide: WidgetNotifyService, useClass: WidgetNotifyServiceStub },
      ]
    });
    service = TestBed.inject(SettingService);
  });

  /**
   * Test blocks
   */

  it('constructor', () => {
    expect(service).toBeTruthy();
  });

  it('setGdbVersionName', () => {
    service.setGdbVersionName('VERSION_A');
    expect(service.getGdbVersionName()).toBe('VERSION_A');
  });

  it('getGdbVersionName', () => {
    expect(service.getGdbVersionName()).toBe('VESION_1');
  });

  it('setDefaultVersion', () => {
    service.setDefaultVersion();
    expect(service.getGdbVersionName()).toBe('DEFAULT');
  });

});
