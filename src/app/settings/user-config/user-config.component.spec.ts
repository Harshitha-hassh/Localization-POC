import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserConfigComponent } from './user-config.component';

describe('UserConfigComponent', () => {
  let component: UserConfigComponent;
  let fixture: ComponentFixture<UserConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
