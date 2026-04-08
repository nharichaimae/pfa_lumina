import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleNav } from './simple-nav';

describe('SimpleNav', () => {
  let component: SimpleNav;
  let fixture: ComponentFixture<SimpleNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
