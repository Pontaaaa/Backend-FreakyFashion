import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-admin-new-product',
  templateUrl: './admin-new-product.component.html',
  styleUrls: ['../../../../assets/styles/admin.css']
})
export class AdminNewProductComponent {
  title = 'Ny produkt';

  formData: any = {
    name: '',
    description: '',
    brand: '',
    sku: '',
    price: '',
    publicationDate: '',
    image: null
  };

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  handleChange(event: any) {
    const { name, value, type, files } = event.target;
    this.formData[name] = type === 'file' ? files[0] : value;
  }

  handleSubmit(event: Event) {
    event.preventDefault();

    const form = new FormData();
    for (const key in this.formData) {
      form.append(key, this.formData[key]);
    }

    this.productService.createProduct(form).subscribe({
      next: (res) => {
        alert(res.message || 'Produkten har lagts till!');
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        alert(err.error?.message || 'Något gick fel vid sparning av produkten.');
      }
    });
  }
}