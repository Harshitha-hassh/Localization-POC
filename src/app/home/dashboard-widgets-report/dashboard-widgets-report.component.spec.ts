import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidgetsReportComponent } from './dashboard-widgets-report.component';

describe('DashboardWidgetsReportComponent', () => {
  let component: DashboardWidgetsReportComponent;
  let fixture: ComponentFixture<DashboardWidgetsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
