import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchweremessungEditComponent } from './schweremessung-edit.component';

describe('SchweremessungEditComponent', () => {
  let component: SchweremessungEditComponent;
  let fixture: ComponentFixture<SchweremessungEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchweremessungEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchweremessungEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
