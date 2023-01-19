import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MsGraphAuthComponent } from './ms-graph-auth.component';

describe('MsGraphAuthComponent', () => {
  let component: MsGraphAuthComponent;
  let fixture: ComponentFixture<MsGraphAuthComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MsGraphAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsGraphAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
