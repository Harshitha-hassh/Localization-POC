import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleSetupComponent } from './role-setup.component';

describe('RoleSetupComponent', () => {
  let component: RoleSetupComponent;
  let fixture: ComponentFixture<RoleSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
