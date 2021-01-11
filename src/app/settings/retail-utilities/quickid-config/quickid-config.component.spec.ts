import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickidConfigComponent } from './quickid-config.component';

describe('QuickidConfigComponent', () => {
  let component: QuickidConfigComponent;
  let fixture: ComponentFixture<QuickidConfigComponent>;

  beforeEach(async(() => {
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
