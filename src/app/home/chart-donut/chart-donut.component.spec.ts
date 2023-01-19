import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartDonutComponent } from './chart-donut.component';

describe('ChartDonutComponent', () => {
  let component: ChartDonutComponent;
  let fixture: ComponentFixture<ChartDonutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDonutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
