import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentsRegistry } from './components-registry';

describe('ComponentsRegistry', () => {
  let component: ComponentsRegistry;
  let fixture: ComponentFixture<ComponentsRegistry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsRegistry],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentsRegistry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
