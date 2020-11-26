import { TestBed } from '@angular/core/testing';

import { Lk25Service } from './lk25.service';

describe('Lk25Service', () => {
  let service: Lk25Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lk25Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
