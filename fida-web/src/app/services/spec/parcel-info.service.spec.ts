import { TestBed } from '@angular/core/testing';

import { ParcelInfoService } from '../parcel-info.service';

describe('ParcelInfoService', () => {
  let service: ParcelInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParcelInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
