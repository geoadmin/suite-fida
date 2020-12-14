import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontaktManagerComponent } from './kontakt-manager.component';

describe('KontaktManagerComponent', () => {
  let component: KontaktManagerComponent;
  let fixture: ComponentFixture<KontaktManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontaktManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontaktManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
