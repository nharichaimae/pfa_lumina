import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pieces } from './pieces';

describe('Pieces', () => {
  let component: Pieces;
  let fixture: ComponentFixture<Pieces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pieces]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pieces);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
