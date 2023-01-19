import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportRetailComponent } from './report-retail.component';

describe('ReportRetailComponent', () => {
  let component: ReportRetailComponent;
  let fixture: ComponentFixture<ReportRetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
