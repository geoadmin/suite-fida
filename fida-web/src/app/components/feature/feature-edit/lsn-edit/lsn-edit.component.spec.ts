import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LsnEditComponent } from './lsn-edit.component';

describe('LsnEditComponent', () => {
  let component: LsnEditComponent;
  let fixture: ComponentFixture<LsnEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LsnEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LsnEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
