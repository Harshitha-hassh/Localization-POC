import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewUserComponent } from './new-user.component';

describe('NewUserComponent', () => {
  let component: NewUserComponent;
  let fixture: ComponentFixture<NewUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
