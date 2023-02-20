import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestPolicyWrapperComponent } from './guest-policy-wrapper.component';

describe('GuestPolicyWrapperComponent', () => {
  let component: GuestPolicyWrapperComponent;
  let fixture: ComponentFixture<GuestPolicyWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GuestPolicyWrapperComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GuestPolicyWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
