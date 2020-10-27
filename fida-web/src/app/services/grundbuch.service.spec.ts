import { TestBed } from '@angular/core/testing';

import { GrundbuchService } from './grundbuch.service';

describe('GrundbuchService', () => {
  let service: GrundbuchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrundbuchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
