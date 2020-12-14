import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontaktEditDialogComponent } from './kontakt-edit-dialog.component';

describe('KontaktEditDialogComponent', () => {
  let component: KontaktEditDialogComponent;
  let fixture: ComponentFixture<KontaktEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontaktEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontaktEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
