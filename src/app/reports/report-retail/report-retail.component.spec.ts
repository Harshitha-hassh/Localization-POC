import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRetailComponent } from './report-retail.component';

describe('ReportRetailComponent', () => {
  let component: ReportRetailComponent;
  let fixture: ComponentFixture<ReportRetailComponent>;

  beforeEach(async(() => {
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
