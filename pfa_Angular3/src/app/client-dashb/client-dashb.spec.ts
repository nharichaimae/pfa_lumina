import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDashb } from './client-dashb';

describe('ClientDashb', () => {
  let component: ClientDashb;
  let fixture: ComponentFixture<ClientDashb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDashb]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDashb);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
