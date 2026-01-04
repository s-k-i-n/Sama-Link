import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlButton } from './sl-button';

describe('SlButton', () => {
  let component: SlButton;
  let fixture: ComponentFixture<SlButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
