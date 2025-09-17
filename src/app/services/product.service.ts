import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ===== Models ===== */
export interface Product {
  id: number;
  name: string;
  brand: string;
  sku: string;
  price: number;
  image: string;
  description: string;
  slug: string;
  publicationDate: string;
  isNew: number;
  // Optional: join data
  // categories?: Category[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
}

/* ===== Service ===== */
@Injectable({ providedIn: 'root' })
export class ProductService {
  // If you have proxy.conf.json, use relative /api paths:
  private readonly _apiRoot = '/api';

  // Products
  private readonly productsUrl = `${this._apiRoot}/products`;

  // Categories
  private readonly categoriesUrl = `${this._apiRoot}/categories`;

  constructor(private http: HttpClient) {}

  /* ---------- Products ---------- */

  /** Get all products (optionally filtered by category slug or id) */
  getAll(options?: { category?: string; categoryId?: number }): Observable<Product[]> {
    let params = new HttpParams();
    if (options?.category) params = params.set('category', options.category);
    if (options?.categoryId != null) params = params.set('categoryId', options.categoryId);
    return this.http.get<Product[]>(this.productsUrl, { params });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.productsUrl}/${id}`);
  }

  createProduct(form: FormData): Observable<{ message: string; id?: number }> {
    return this.http.post<{ message: string; id?: number }>(this.productsUrl, form);
  }

  search(q: string): Observable<Product[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Product[]>(`${this.productsUrl}/search`, { params });
  }

  /* ---------- Categories ---------- */

  /** List all categories */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  /** Get one category */
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.categoriesUrl}/${id}`);
  }

  /**
   * Create a category.
   * Send as multipart/form-data so image is optional.
   * Usage:
   *   const fd = new FormData();
   *   fd.append('name', name);
   *   fd.append('slug', slug);
   *   if (file) fd.append('image', file);
   *   service.createCategory(fd)
   */
  createCategory(form: FormData): Observable<any> {
    return this.http.post(this.categoriesUrl, form);
  }

  /**
   * Update a category (partial). Also multipart so you can change image.
   * Usage (edit):
   *   const fd = new FormData();
   *   fd.append('name', name);
   *   fd.append('slug', slug);
   *   if (file) fd.append('image', file);
   *   service.updateCategory(id, fd)
   */
  updateCategory(id: number, form: FormData): Observable<any> {
    return this.http.put(`${this.categoriesUrl}/${id}`, form);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.categoriesUrl}/${id}`);
  }
}