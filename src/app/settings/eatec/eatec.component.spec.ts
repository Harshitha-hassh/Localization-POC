import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EatecComponent } from './eatec.component';

describe('EatecComponent', () => {
  let component: EatecComponent;
  let fixture: ComponentFixture<EatecComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [EatecComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EatecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
