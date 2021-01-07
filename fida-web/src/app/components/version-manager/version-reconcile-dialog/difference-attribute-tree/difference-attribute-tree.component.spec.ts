import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DifferenceAttributeTreeComponent } from './difference-attribute-tree.component';

describe('DifferenceAttributeTreeComponent', () => {
  let component: DifferenceAttributeTreeComponent;
  let fixture: ComponentFixture<DifferenceAttributeTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DifferenceAttributeTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DifferenceAttributeTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
