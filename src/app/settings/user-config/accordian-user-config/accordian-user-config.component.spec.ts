import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordianUserConfigComponent } from './accordian-user-config.component';

describe('AccordianUserConfigComponent', () => {
  let component: AccordianUserConfigComponent;
  let fixture: ComponentFixture<AccordianUserConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccordianUserConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordianUserConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
