import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrundbuchEditComponent } from './grundbuch-edit.component';

describe('GrundbuchEditComponent', () => {
  let component: GrundbuchEditComponent;
  let fixture: ComponentFixture<GrundbuchEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrundbuchEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrundbuchEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
