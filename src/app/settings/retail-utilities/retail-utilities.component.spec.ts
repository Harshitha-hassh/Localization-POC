import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RetailUtilitiesComponent } from './retail-utilities.component';

describe('RetailUtilitiesComponent', () => {
  let component: RetailUtilitiesComponent;
  let fixture: ComponentFixture<RetailUtilitiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailUtilitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailUtilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
