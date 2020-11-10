import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeValueEditComponent } from './attribute-value-edit.component';

describe('AttributeValueEditComponent', () => {
  let component: AttributeValueEditComponent;
  let fixture: ComponentFixture<AttributeValueEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeValueEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeValueEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
