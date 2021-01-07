import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DifferenceListTreeComponent } from './difference-list-tree.component';

describe('DifferenceListTreeComponent', () => {
  let component: DifferenceListTreeComponent;
  let fixture: ComponentFixture<DifferenceListTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DifferenceListTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DifferenceListTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
