import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, Category } from 'src/app/services/product.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  categories: Category[] = [];
  search = '';

  constructor(private ps: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.ps.getCategories().subscribe(cats => this.categories = cats);
  }

  handleSearchSubmit(e: Event) {
    e.preventDefault();
    const q = this.search.trim();
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
  }
}