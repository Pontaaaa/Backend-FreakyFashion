import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService, Category } from '../../services/product.service';

@Component({
  standalone: true,
  selector: 'admin-category-form',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="p-4">
      <h1>{{ isEdit ? 'Redigera kategori' : 'Ny kategori' }}</h1>

      <form (ngSubmit)="save()">
        <label>
          Namn
          <input [(ngModel)]="name" name="name" required (input)="updateSlug()">
        </label>

        <label>
          Slug
          <input [(ngModel)]="slug" name="slug" required>
        </label>

        <label>
          Bild (valfritt)
          <input type="file" (change)="onFile($event)">
        </label>

        <div *ngIf="previewUrl">
          <p>Förhandsvisning:</p>
          <img [src]="previewUrl" alt="preview" width="140">
        </div>

        <button type="submit">{{ isEdit ? 'Spara' : 'Skapa' }}</button>
        <a [routerLink]="['/admin/categories']">Tillbaka</a>
      </form>
    </section>
  `
})
export class AdminCategoryFormComponent implements OnInit {
  isEdit = false;
  id?: number;
  name = '';
  slug = '';
  imageFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private ps: ProductService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.ps.getCategory(this.id).subscribe(c => {
        this.name = c.name;
        this.slug = c.slug;
        this.previewUrl = c.image ?? null;
      });
    }
  }

  updateSlug() {
    if (!this.isEdit) {
      this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-');
    }
  }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.imageFile = input.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  save() {
  if (!this.name || !this.slug) return;

  const fd = new FormData();
  fd.append('name', this.name);
  fd.append('slug', this.slug);
  if (this.imageFile) fd.append('image', this.imageFile);

  if (this.isEdit && this.id != null) {
    this.ps.updateCategory(this.id, fd).subscribe(() => this.router.navigate(['/admin/categories']));
  } else {
    this.ps.createCategory(fd).subscribe(() => this.router.navigate(['/admin/categories']));
  }
 } 
}