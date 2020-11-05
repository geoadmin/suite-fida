import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionReconcileDialogComponent } from './version-reconcile-dialog.component';

describe('VersionReconcileDialogComponent', () => {
  let component: VersionReconcileDialogComponent;
  let fixture: ComponentFixture<VersionReconcileDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionReconcileDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionReconcileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
