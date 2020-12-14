import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontaktViewComponent } from './kontakt-view.component';

describe('KontaktViewComponent', () => {
  let component: KontaktViewComponent;
  let fixture: ComponentFixture<KontaktViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontaktViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontaktViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
