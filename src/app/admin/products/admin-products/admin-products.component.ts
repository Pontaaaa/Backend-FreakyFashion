import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from 'src/app/services/product.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['../../../../assets/styles/admin.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loaded = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    document.title = 'Produkter';
  }

  fetchProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loaded = true;
      },
      error: () => alert('Kunde inte hämta produkter.')
    });
  }

  handleDelete(event: Event, id: number): void {
    event.preventDefault();
    const confirmed = confirm('Vill du verkligen ta bort produkten?');
    if (!confirmed) return;

    this.productService.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
      },
      error: () => alert('Kunde inte ta bort produkten.')
    });
  }
}