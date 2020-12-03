import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuslandpunktEditComponent } from './auslandpunkt-edit.component';

describe('AuslandpunktEditComponent', () => {
  let component: AuslandpunktEditComponent;
  let fixture: ComponentFixture<AuslandpunktEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuslandpunktEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuslandpunktEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
