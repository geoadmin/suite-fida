import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LfpEditComponent } from './lfp-edit.component';

describe('LfpEditComponent', () => {
  let component: LfpEditComponent;
  let fixture: ComponentFixture<LfpEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LfpEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LfpEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
