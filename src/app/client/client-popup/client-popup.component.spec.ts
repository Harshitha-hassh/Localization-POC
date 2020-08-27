import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPopupComponent } from './client-popup.component';

describe('ClientPopupComponent', () => {
  let component: ClientPopupComponent;
  let fixture: ComponentFixture<ClientPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
