import { TestBed } from '@angular/core/testing';

import { SearchSourceService } from '../search-source.service';

xdescribe('SearchSourceService', () => {
  let service: SearchSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
