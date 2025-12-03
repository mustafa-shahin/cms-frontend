import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualSettings } from './visual-settings';

describe('VisualSettings', () => {
  let component: VisualSettings;
  let fixture: ComponentFixture<VisualSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
