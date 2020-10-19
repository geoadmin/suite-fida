import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureAttributeEditComponent } from './feature-attribute-edit.component';

describe('FeatureAttributeEditComponent', () => {
  let component: FeatureAttributeEditComponent;
  let fixture: ComponentFixture<FeatureAttributeEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureAttributeEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureAttributeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
