import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDashboardConfigurationComponent } from './home-dashboard-configuration.component';

describe('HomeDashboardConfigurationComponent', () => {
  let component: HomeDashboardConfigurationComponent;
  let fixture: ComponentFixture<HomeDashboardConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeDashboardConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDashboardConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
