import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DifferenceTreeComponent } from './difference-tree.component';

describe('DifferenceTreeComponent', () => {
  let component: DifferenceTreeComponent;
  let fixture: ComponentFixture<DifferenceTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DifferenceTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DifferenceTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
