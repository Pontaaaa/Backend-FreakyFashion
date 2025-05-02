import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        console.log("✅ Products loaded:", data);
        this.products = data;
      },
      error: (err) => {
        console.error("❌ Failed to fetch products:", err);
      }
    });
  }
}