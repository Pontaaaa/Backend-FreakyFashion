import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';
  private base = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  createProduct(form: FormData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.base, form);
  }

  search(q: string): Observable<Product[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Product[]>(`${this.base}/search`, { params });
  }
}