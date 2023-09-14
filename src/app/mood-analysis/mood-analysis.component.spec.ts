import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodAnalysisComponent } from './mood-analysis.component';

describe('MoodAnalysisComponent', () => {
  let component: MoodAnalysisComponent;
  let fixture: ComponentFixture<MoodAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoodAnalysisComponent]
    });
    fixture = TestBed.createComponent(MoodAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
