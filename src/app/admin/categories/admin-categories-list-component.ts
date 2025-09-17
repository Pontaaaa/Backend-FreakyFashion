import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Category } from '../../services/product.service';

@Component({
  standalone: true,
  selector: 'admin-categories-list',
  imports: [CommonModule, RouterModule],
  template: `
    <section class="p-4">
      <h1>Kategorier</h1>
      <a class="btn" [routerLink]="['/admin/categories/new']">Ny kategori</a>

      <table class="table">
        <thead>
          <tr><th>Bild</th><th>Namn</th><th>Slug</th><th>Åtgärder</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of categories">
            <td>
              <img *ngIf="c.image" [src]="c.image" alt="{{c.name}}" width="60">
            </td>
            <td>{{ c.name }}</td>
            <td>{{ c.slug }}</td>
            <td>
              <a [routerLink]="['/admin/categories', c.id]">Redigera</a>
              &nbsp;|&nbsp;
              <button (click)="remove(c.id)">Ta bort</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class AdminCategoriesListComponent implements OnInit {
  categories: Category[] = [];
  constructor(private ps: ProductService) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.ps.getCategories().subscribe(c => this.categories = c);
  }
  remove(id: number) {
    if (!confirm('Ta bort kategori?')) return;
    this.ps.deleteCategory(id).subscribe(() => this.load());
  }
}