import { TestBed } from '@angular/core/testing';

import { FidaTranslateService } from '../translate.service';

describe('FidaTranslateService', () => {
  let service: FidaTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FidaTranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});