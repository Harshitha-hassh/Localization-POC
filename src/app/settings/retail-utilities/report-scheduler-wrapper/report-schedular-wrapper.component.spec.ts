import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSchedularWrapperComponent } from './report-schedular-wrapper.component';

describe('ReportSchedularWrapperComponent', () => {
  let component: ReportSchedularWrapperComponent;
  let fixture: ComponentFixture<ReportSchedularWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSchedularWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSchedularWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
