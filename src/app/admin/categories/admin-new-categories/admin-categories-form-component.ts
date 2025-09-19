import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
@Component({
  standalone: true,
  selector: 'admin-category-form',
  imports: [CommonModule, FormsModule, RouterModule],
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
          <h2>Ny kategori</h2>
          <div class="button-group">
            <a routerLink="/admin/categories" class="new-product-button">Tillbaka</a>
          </div>
        </div>

        <form (ngSubmit)="save()" class="admin-form">
          <div class="form-row">
            <label for="name">Namn</label>
            <input id="name" name="name" [(ngModel)]="name" required />
          </div>

          <div class="form-row">
            <label for="image">Bild (valfritt)</label>
            <input id="image" type="file" (change)="onFile($event)" />
          </div>

          <div class="form-row" *ngIf="previewUrl">
            <label>Förhandsvisning</label>
            <img [src]="previewUrl" alt="preview" width="140" style="object-fit:cover;border-radius:6px;">
          </div>

          <div class="form-actions">
            <button type="submit" class="new-product-button">Skapa</button>
          </div>
        </form>
      </main>
    </div>
  </div>
`
})
export class AdminCategoryFormComponent {
  name = '';
  imageFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private ps: ProductService, private router: Router) {}

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.imageFile = input.files?.[0] ?? null;
    if (this.imageFile) {
      const r = new FileReader();
      r.onload = () => (this.previewUrl = r.result as string);
      r.readAsDataURL(this.imageFile);
    } else {
      this.previewUrl = null;
    }
  }

  save() {
    if (!this.name.trim()) return;
    const fd = new FormData();
    fd.append('name', this.name.trim());
    if (this.imageFile) fd.append('image', this.imageFile);

    this.ps.createCategory(fd).subscribe(() => {
      this.router.navigate(['/admin/categories']);
    });
  }
}