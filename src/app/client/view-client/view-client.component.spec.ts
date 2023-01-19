import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewCientComponenet } from './view-client.component';

describe('ViewCientComponenet', () => {
  let component: ViewCientComponenet;
  let fixture: ComponentFixture<ViewCientComponenet>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCientComponenet ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCientComponenet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
