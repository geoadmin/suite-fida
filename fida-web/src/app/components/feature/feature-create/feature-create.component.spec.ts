import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureCreateComponent } from './feature-create.component';

describe('FeatureCreateComponent', () => {
  let component: FeatureCreateComponent;
  let fixture: ComponentFixture<FeatureCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
