import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionPublicaComponent } from './informacion-publica.component';

describe('InformacionPublicaComponent', () => {
  let component: InformacionPublicaComponent;
  let fixture: ComponentFixture<InformacionPublicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionPublicaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionPublicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
