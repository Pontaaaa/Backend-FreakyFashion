import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  categories?: Category[];
}

/* ===== Service ===== */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _apiRoot = '/api';

  private readonly productsUrl = `${this._apiRoot}/products`;

  private readonly categoriesUrl = `${this._apiRoot}/categories`;

  constructor(private http: HttpClient) {}



  getAll(options?: { category?: string; categoryId?: number }): Observable<Product[]> {
    let params = new HttpParams();
    if (options?.category) params = params.set('category', options.category);
    if (options?.categoryId != null) params = params.set('categoryId', options.categoryId);
    return this.http.get<Product[]>(this.productsUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.productsUrl}/${id}`);
  }

  createProduct(form: FormData): Observable<{ message: string; id?: number }> {
    return this.http.post<{ message: string; id?: number }>(this.productsUrl, form);
  }

  updateProduct(id: number, form: FormData): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.productsUrl}/${id}`, form);
  }

  search(q: string): Observable<Product[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Product[]>(`${this.productsUrl}/search`, { params });
  }



  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.categoriesUrl}/${id}`);
  }

  createCategory(form: FormData): Observable<any> {
    return this.http.post(this.categoriesUrl, form);
  }

  updateCategory(id: number, form: FormData): Observable<any> {
    return this.http.put(`${this.categoriesUrl}/${id}`, form);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.categoriesUrl}/${id}`);
  }
}