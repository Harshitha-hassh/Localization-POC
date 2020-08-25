import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailTemplatesComponent } from './retail-templates.component';

describe('RetailTemplatesComponent', () => {
  let component: RetailTemplatesComponent;
  let fixture: ComponentFixture<RetailTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
