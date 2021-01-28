import { TestBed } from '@angular/core/testing';

import { VersionManagementService } from '../version-management.service';

xdescribe('VersionService', () => {
  let service: VersionManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
