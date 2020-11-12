import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NachfuehrungEditComponent } from './nachfuehrung-edit.component';

describe('NachfuehrungEditComponent', () => {
  let component: NachfuehrungEditComponent;
  let fixture: ComponentFixture<NachfuehrungEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NachfuehrungEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NachfuehrungEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
