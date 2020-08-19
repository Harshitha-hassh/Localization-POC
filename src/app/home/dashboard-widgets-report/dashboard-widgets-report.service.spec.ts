import { TestBed } from '@angular/core/testing';

import { DashboardWidgetsReportService } from './dashboard-widgets-report.service';

describe('DashboardWidgetsReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardWidgetsReportService = TestBed.get(DashboardWidgetsReportService);
    expect(service).toBeTruthy();
  });
});
