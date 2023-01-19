import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickidConfigComponent } from './quickid-config.component';

describe('QuickidConfigComponent', () => {
  let component: QuickidConfigComponent;
  let fixture: ComponentFixture<QuickidConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickidConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickidConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
