import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewProductComponent } from './admin-new-product.component';

describe('AdminNewProductComponent', () => {
  let component: AdminNewProductComponent;
  let fixture: ComponentFixture<AdminNewProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminNewProductComponent]
    });
    fixture = TestBed.createComponent(AdminNewProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
