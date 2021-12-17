import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterDefaultConfigurationComponent } from './printer-default-configuration.component';

describe('PrinterDefaultConfigurationComponent', () => {
  let component: PrinterDefaultConfigurationComponent;
  let fixture: ComponentFixture<PrinterDefaultConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrinterDefaultConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterDefaultConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
