import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureListTreeComponent } from './feature-list-tree.component';

describe('FeatureListTreeComponent', () => {
  let component: FeatureListTreeComponent;
  let fixture: ComponentFixture<FeatureListTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureListTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureListTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
