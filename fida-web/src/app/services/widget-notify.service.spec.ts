import { TestBed } from '@angular/core/testing';

import { WidgetNotifyService } from './widget-notify.service';

describe('WidgetNotifyService', () => {
  let service: WidgetNotifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetNotifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
