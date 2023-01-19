import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotifyPopupComponent } from './notify-popup.component';

describe('NotifyPopupComponent', () => {
  let component: NotifyPopupComponent;
  let fixture: ComponentFixture<NotifyPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifyPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
