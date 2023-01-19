import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RetailSettingsComponent } from './retail-settings.component';

describe('RetailSettingsComponent', () => {
  let component: RetailSettingsComponent;
  let fixture: ComponentFixture<RetailSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
