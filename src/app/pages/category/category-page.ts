import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { ProductService, Product } from 'src/app/services/product.service';

@Component({
  standalone: true,
  selector: 'app-category-page',
  imports: [CommonModule, RouterModule],
  template: `
    <section class="category-page">
      <h1>{{ title }}</h1>

      <div *ngIf="loading">Laddar...</div>

      <div *ngIf="!loading && products.length === 0">
        Inga produkter hittades i denna kategori.
      </div>

      <div class="product-grid" *ngIf="!loading && products.length">
        <article class="product-card" *ngFor="let p of products">
          <a [routerLink]="['/products', p.slug]">
            <img *ngIf="p.image" [src]="p.image" [alt]="p.name">
            <div class="meta">
              <h3>{{ p.name }}</h3>
              <p>{{ p.price | number:'1.0-0' }} SEK</p>
            </div>
          </a>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .product-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    .product-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #fff; }
    .product-card img { width: 100%; height: 160px; object-fit: cover; display: block; }
    .product-card .meta { padding: 8px 10px; }
    h1 { margin: 12px 0 16px; }
  `]
})
export class CategoryPageComponent implements OnInit {
  title = 'Kategori';
  products: Product[] = [];
  loading = true;

  constructor(private route: ActivatedRoute, private ps: ProductService) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.title = this.formatTitle(slug);
    this.ps.getAll({ category: slug }).subscribe({
      next: (data) => { this.products = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  private formatTitle(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}