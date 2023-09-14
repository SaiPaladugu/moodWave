import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodHomeComponent } from './mood-home.component';

describe('MoodHomeComponent', () => {
  let component: MoodHomeComponent;
  let fixture: ComponentFixture<MoodHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoodHomeComponent]
    });
    fixture = TestBed.createComponent(MoodHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
