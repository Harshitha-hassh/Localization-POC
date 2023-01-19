import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DayEndComponent } from './day-end.component';

describe('DayEndComponent', () => {
  let component: DayEndComponent;
  let fixture: ComponentFixture<DayEndComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DayEndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
