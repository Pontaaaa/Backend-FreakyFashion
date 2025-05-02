import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['../../../../assets/styles/admin.css']
})
export class AdminProductsComponent implements OnInit {
  title = 'Produkter';
  products: Product[] = [];
  loaded = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    document.title = this.title;
    this.fetchProducts();
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

  handleDelete(productId: number): void {
    if (!confirm('Vill du verkligen ta bort produkten?')) return;

    this.productService.delete(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== productId);
      },
      error: () => alert('Kunde inte ta bort produkten.')
    });
  }
}