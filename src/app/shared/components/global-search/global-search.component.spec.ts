import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RetailGlobalSearchComponent } from './global-search.component';

describe('GlobalSearchComponent', () => {
  let component: RetailGlobalSearchComponent;
  let fixture: ComponentFixture<RetailGlobalSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailGlobalSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailGlobalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
