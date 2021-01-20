import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeValueViewComponent } from './attribute-value-view.component';

describe('AttributeValueViewComponent', () => {
  let component: AttributeValueViewComponent;
  let fixture: ComponentFixture<AttributeValueViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeValueViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeValueViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
