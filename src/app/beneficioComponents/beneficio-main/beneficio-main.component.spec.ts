import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficioMainComponent } from './beneficio-main.component';

describe('BeneficioMainComponent', () => {
  let component: BeneficioMainComponent;
  let fixture: ComponentFixture<BeneficioMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeneficioMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficioMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
