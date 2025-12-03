import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiInterfaces } from './api-interfaces';

describe('ApiInterfaces', () => {
  let component: ApiInterfaces;
  let fixture: ComponentFixture<ApiInterfaces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiInterfaces],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiInterfaces);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
