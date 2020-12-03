import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchaedenEditComponent } from './schaeden-edit.component';

describe('SchaedenEditComponent', () => {
  let component: SchaedenEditComponent;
  let fixture: ComponentFixture<SchaedenEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchaedenEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchaedenEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
