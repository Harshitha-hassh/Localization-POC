import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserMachineConfigurationComponent } from './user-machine-configuration.component';

describe('UserMachineConfigurationComponent', () => {
  let component: UserMachineConfigurationComponent;
  let fixture: ComponentFixture<UserMachineConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMachineConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMachineConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
