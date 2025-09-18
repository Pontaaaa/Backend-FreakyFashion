import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService, Category, Product } from 'src/app/services/product.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: false, // keep as you have it today; if standalone, add imports: [CommonModule, RouterModule]
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  hero: { image: string } | null = null;
  gridImages: string[] = [
    'pexels-jonaorle-3828245.jpg',
    'pexels-callmehuyuno-347917.jpg',
    'pexels-ralph-rabago-3214683.jpg'
  ];

  products: Product[] = [];
  categories: Category[] = [];   // NEW

  constructor(private http: HttpClient, private ps: ProductService) {}

  ngOnInit(): void {
    document.title = 'Freaky Fashion';

    this.http.get<{ image: string }>('/api/hero').subscribe({
      next: (data) => this.hero = data,
      error: () => console.error('Kunde inte ladda hero-sektionen.')
    });

    this.http.get<Product[]>('/api/products').subscribe({
      next: (data) => this.products = data,
      error: () => console.error('Kunde inte hämta produkter.')
    });

    // NEW: fetch categories for the home page
    this.ps.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => console.error('Kunde inte hämta kategorier.')
    });
  }
}