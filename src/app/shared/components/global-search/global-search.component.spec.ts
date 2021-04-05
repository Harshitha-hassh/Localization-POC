import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailGlobalSearchComponent } from './global-search.component';

describe('GlobalSearchComponent', () => {
  let component: RetailGlobalSearchComponent;
  let fixture: ComponentFixture<RetailGlobalSearchComponent>;

  beforeEach(async(() => {
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
