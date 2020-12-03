import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HfpEditComponent } from './hfp-edit.component';

describe('HfpEditComponent', () => {
  let component: HfpEditComponent;
  let fixture: ComponentFixture<HfpEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HfpEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HfpEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
