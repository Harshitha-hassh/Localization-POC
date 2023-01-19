import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReceiptConfigurationComponent } from './receipt-configuration.component';

describe('ReceiptConfigurationComponent', () => {
  let component: ReceiptConfigurationComponent;
  let fixture: ComponentFixture<ReceiptConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiptConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
