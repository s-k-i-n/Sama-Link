import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlCard } from './sl-card';

describe('SlCard', () => {
  let component: SlCard;
  let fixture: ComponentFixture<SlCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
