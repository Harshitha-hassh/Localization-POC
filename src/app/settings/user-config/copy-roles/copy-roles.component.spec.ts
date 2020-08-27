import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyRolesComponent } from './copy-roles.component';

describe('CopyRolesComponent', () => {
  let component: CopyRolesComponent;
  let fixture: ComponentFixture<CopyRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
