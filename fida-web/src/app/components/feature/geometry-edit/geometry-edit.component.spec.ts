import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeometryEditComponent } from './geometry-edit.component';

describe('GeometryEditComponent', () => {
  let component: GeometryEditComponent;
  let fixture: ComponentFixture<GeometryEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeometryEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeometryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
