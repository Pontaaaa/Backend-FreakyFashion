import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';
  private base = '/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
  create(data: any, imageFile: File): Observable<{ message: string }> {
    const form = new FormData();
    form.append('name', data.name);
    form.append('description', data.description);
    form.append('brand', data.brand);
    form.append('sku', data.sku);
    form.append('price', data.price.toString());
    form.append('publicationDate', data.publicationDate);
    form.append('image', imageFile, imageFile.name);
    return this.http.post<{ message: string }>(this.base, form);
  }
  search(q: string): Observable<Product[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Product[]>(`${this.base}/search`, { params });
  }
}