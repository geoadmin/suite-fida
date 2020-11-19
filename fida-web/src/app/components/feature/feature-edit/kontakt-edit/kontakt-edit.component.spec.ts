import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontaktEditComponent } from './kontakt-edit.component';

describe('KontaktEditComponent', () => {
  let component: KontaktEditComponent;
  let fixture: ComponentFixture<KontaktEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontaktEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontaktEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
