import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnhangEditComponent } from './anhang-edit.component';

describe('AnhangEditComponent', () => {
  let component: AnhangEditComponent;
  let fixture: ComponentFixture<AnhangEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnhangEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnhangEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
