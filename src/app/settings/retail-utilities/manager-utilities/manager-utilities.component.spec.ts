import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerUtilitiesComponent } from './manager-utilities.component';

describe('ManagerUtilitiesComponent', () => {
  let component: ManagerUtilitiesComponent;
  let fixture: ComponentFixture<ManagerUtilitiesComponent>;

 beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerUtilitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerUtilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
