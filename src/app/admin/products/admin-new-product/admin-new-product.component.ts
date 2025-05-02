import { Component } from '@angular/core';
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

  constructor(private productService: ProductService) {}

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

    this.productService.create(this.formData, this.formData.image).subscribe({
      next: (res) => {
        alert(res.message || 'Produkten har lagts till!');
      },
      error: (err) => {
        alert(err.error?.message || 'Något gick fel vid sparning av produkten.');
      }
    });
  }
}