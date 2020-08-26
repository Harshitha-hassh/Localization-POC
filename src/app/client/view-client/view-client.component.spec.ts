import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCientComponenet } from './view-client.component';

describe('ViewCientComponenet', () => {
  let component: ViewCientComponenet;
  let fixture: ComponentFixture<ViewCientComponenet>;

  beforeEach(async(() => {
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
