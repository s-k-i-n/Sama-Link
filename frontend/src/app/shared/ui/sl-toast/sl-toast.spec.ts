import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlToast } from './sl-toast';

describe('SlToast', () => {
  let component: SlToast;
  let fixture: ComponentFixture<SlToast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlToast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlToast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
