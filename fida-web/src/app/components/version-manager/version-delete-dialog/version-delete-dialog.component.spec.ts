import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionDeleteDialogComponent } from './version-delete-dialog.component';

describe('VersionDeleteDialogComponent', () => {
  let component: VersionDeleteDialogComponent;
  let fixture: ComponentFixture<VersionDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
