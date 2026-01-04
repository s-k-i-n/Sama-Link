import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlInput } from './sl-input';

describe('SlInput', () => {
  let component: SlInput;
  let fixture: ComponentFixture<SlInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
