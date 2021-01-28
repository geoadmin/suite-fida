import { TestBed } from '@angular/core/testing';

import { TypeaheadService } from '../typeahead.service';

xdescribe('TypeaheadService', () => {
  let service: TypeaheadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeaheadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
