import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigValidationComponent } from './config-validation.component';

describe('ConfigValidationComponent', () => {
  let component: ConfigValidationComponent;
  let fixture: ComponentFixture<ConfigValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigValidationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
