import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CgpsLoggingProfileSyncWrapperComponent } from './cgps-logging-profile-sync-wrapper.component';

describe('CgpsLoggingProfileSyncWrapperComponent', () => {
  let component: CgpsLoggingProfileSyncWrapperComponent;
  let fixture: ComponentFixture<CgpsLoggingProfileSyncWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CgpsLoggingProfileSyncWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CgpsLoggingProfileSyncWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
