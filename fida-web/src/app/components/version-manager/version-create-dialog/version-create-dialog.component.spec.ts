import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionCreateDialogComponent } from './version-create-dialog.component';

describe('CreateVersionDialogComponent', () => {
  let component: VersionCreateDialogComponent;
  let fixture: ComponentFixture<VersionCreateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionCreateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
