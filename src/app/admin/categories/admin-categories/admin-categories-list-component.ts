import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Category } from '../../../services/product.service';

@Component({
  standalone: true,
  selector: 'admin-categories-list',
  imports: [CommonModule, RouterModule],
  template: `
  <div>
    <header>
      <div class="admin-header">
        <h1>Administration</h1>
      </div>
    </header>

    <div class="admin-container">
      <aside class="admin-menu">
        <nav>
          <ul>
            <li><a routerLink="/admin/products" routerLinkActive="active">Produkter</a></li>
            <li><a routerLink="/admin/categories" routerLinkActive="active">Kategorier</a></li>
          </ul>
        </nav>
      </aside>

      <main class="admin-content">
        <div class="content-header">
          <h2>Kategorier</h2>
          <div class="button-group">
            <button (click)="fetch()" class="load-products-button">
              {{ loaded ? 'Uppdatera kategorier' : 'Ladda kategorier' }}
            </button>
            <a routerLink="/admin/categories/new" class="new-product-button">Ny kategori</a>
          </div>
        </div>

        <!-- Table always visible -->
        <table class="product-data-table">
          <thead>
            <tr>
              <th>Namn</th>
              <th style="width:64px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of categories">
              <td>{{ c.name }}</td>
              <td>
                <a href="#" class="trash-icon" title="Ta bort" (click)="onDelete($event, c.id)">
                  <i class="fa-solid fa-trash-can"></i>
                </a>
              </td>
            </tr>
            <!-- Show this if loaded but no categories -->
            <tr *ngIf="categories.length === 0 && loaded">
              <td colspan="2">Inga kategorier hittades.</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  </div>
  `
})
export class AdminCategoriesListComponent {
  categories: Category[] = [];
  loaded = false;

  constructor(private ps: ProductService) {}

  fetch() {
    this.ps.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loaded = true;
      },
      error: () => { this.loaded = true; }
    });
  }

  onDelete(event: Event, id: number) {
    event.preventDefault();
    if (confirm('Är du säker på att du vill ta bort kategorin?')) {
      this.ps.deleteCategory(id).subscribe({
        next: () => this.fetch(),
        error: () => alert('Kunde inte ta bort kategori.')
      });
    }
  }
}