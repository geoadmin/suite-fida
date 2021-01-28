import { TestBed } from '@angular/core/testing';

import { WidgetNotifyService } from '../widget-notify.service';

describe('WidgetNotifyService', () => {
  let service: WidgetNotifyService;

  /**
   * Run before each test block
   */

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetNotifyService);
  });

  /**
   * Test blocks
   */

  it('constructor', () => {
    expect(service).toBeTruthy();
    expect(service.onGeometryEditSubject).toBeDefined();
    expect(service.onGeometryEditCompleteSubject).toBeDefined();
    expect(service.onFeatureEditSubject).toBeDefined();
    expect(service.onFeatureEditCompleteSubject).toBeDefined();
    expect(service.onFeatureCreateCompleteSubject).toBeDefined();
    expect(service.onFeatureDeleteSubject).toBeDefined();
    expect(service.onGdbVersionChangedSubject).toBeDefined();
    expect(service.setMapPopupVisibilitySubject).toBeDefined();
    expect(service.enableMapPopupSubject).toBeDefined();
  });
});
