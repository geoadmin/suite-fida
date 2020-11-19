import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RueckversicherungEditComponent } from './rueckversicherung-edit.component';

describe('RueckversicherungEditComponent', () => {
  let component: RueckversicherungEditComponent;
  let fixture: ComponentFixture<RueckversicherungEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RueckversicherungEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RueckversicherungEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
