import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlModal } from './sl-modal';

describe('SlModal', () => {
  let component: SlModal;
  let fixture: ComponentFixture<SlModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
