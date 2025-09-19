import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ===== Models ===== */
export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
}

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
  /** Optional: categories joined from backend (GET /api/products/:id) */
  categories?: Category[];
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

  /** Get one product (backend returns categories too) */
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.productsUrl}/${id}`);
  }

  /** Create a product (send FormData; include `categoryIds` as JSON string if present) */
  createProduct(form: FormData): Observable<{ message: string; id?: number }> {
    return this.http.post<{ message: string; id?: number }>(this.productsUrl, form);
  }

  /** Update a product (send FormData; include `categoryIds` as JSON string if present) */
  updateProduct(id: number, form: FormData): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.productsUrl}/${id}`, form);
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

  /** Create a category (multipart; only `name` required; image optional) */
  createCategory(form: FormData): Observable<any> {
    return this.http.post(this.categoriesUrl, form);
  }

  /** Update a category (multipart; partial update) */
  updateCategory(id: number, form: FormData): Observable<any> {
    return this.http.put(`${this.categoriesUrl}/${id}`, form);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.categoriesUrl}/${id}`);
  }
}