import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPropertyComponent } from './set-property.component';

describe('SetPropertyComponent', () => {
  let component: SetPropertyComponent;
  let fixture: ComponentFixture<SetPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetPropertyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
