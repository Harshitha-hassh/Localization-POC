import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImgThumbnailComponent } from './img-thumbnail.component';

describe('ImgThumbnailComponent', () => {
  let component: ImgThumbnailComponent;
  let fixture: ComponentFixture<ImgThumbnailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
