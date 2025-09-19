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
      <h1 class="category-title">{{ title }}</h1>

      <div *ngIf="loading">Laddar...</div>

      <div *ngIf="!loading && products.length === 0">
        Inga produkter hittades i denna kategori.
      </div>

      <div class="product-grid" *ngIf="!loading && products.length">
        <article class="product-card" *ngFor="let p of products">
          <a class="card-link" [routerLink]="['/products', p.slug]">
            <div class="media">
              <img *ngIf="p.image" [src]="imageBase + p.image" [alt]="p.name" />
              <span *ngIf="p.isNew" class="badge">Nyhet</span>

              <button
                class="wish"
                type="button"
                aria-label="Lägg till i favoriter"
                (click)="toggleWish($event, p.id)"
                title="Favorit"
              >
                <i class="fa-heart"
                   [class.fa-regular]="!isWished(p.id)"
                   [class.fa-solid]="isWished(p.id)"></i>
              </button>
            </div>

            <div class="meta">
              <h3 class="name">{{ p.name }}</h3>
              <div class="row">
                <span class="brand">{{ p.brand }}</span>
                <span class="price">{{ p.price | number:'1.0-0' }} SEK</span>
              </div>
            </div>
          </a>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .category-page { text-align: center; }
    .category-title { margin: 20px 0; font-size: 2rem; font-weight: bold; }

    .product-grid {
      display: grid;
      gap: 16px;
      /* was: minmax(220px, 1fr) — small cards can make images look soft */
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      text-align: left;
      }

    .product-card { border: 1px solid #e6e6e6; border-radius: 10px; overflow: hidden; background: #fff; }
    .card-link { display: block; text-decoration: none; color: inherit; }

    .media { position: relative; }
    .media img {
      width: 100%;
      height: 260px;         /* was 220px */
      object-fit: cover;
      display: block;
      background: #f6f6f6;
      image-rendering: auto; /* ensure normal rendering */
      }
    .badge {
      position: absolute; top: 8px; left: 8px;
      background: #000; color: #fff;
      font-size: 0.9rem; padding: 6px 10px; border-radius: 4px; font-weight: 600;
    }

    .wish {
      position: absolute;
      right: 10px;
      bottom: 6px;
      border: none;
      background: transparent;
      font-size: 1.4rem;
      cursor: pointer;
      color: #000;
    }

    .meta { padding: 10px 12px; }
    .name { margin: 0 0 6px; font-size: 1rem; line-height: 1.3; font-weight: 600; }
    .row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
    .brand { font-weight: 700; color: #222; }
    .price { font-weight: 700; }
  `]
})
export class CategoryPageComponent implements OnInit {
  title = 'Kategori';
  products: Product[] = [];
  loading = true;

  readonly imageBase = 'http://localhost:3000';

  /** ids of wished products (local UI state) */
  private wished = new Set<number>();

  constructor(private route: ActivatedRoute, private ps: ProductService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(pm => {
      const slug = pm.get('slug')!;
      this.title = this.pretty(slug);
      this.loading = true;
      this.ps.getAll({ category: slug }).subscribe({
        next: data => { this.products = data; this.loading = false; },
        error: () => { this.loading = false; }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  isWished(id: number) { return this.wished.has(id); }

  toggleWish(e: Event, id: number) {
    e.preventDefault();
    e.stopPropagation();
    if (this.wished.has(id)) this.wished.delete(id);
    else this.wished.add(id);
  }

  private pretty(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}