import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  query = '';
  results: Product[] = [];
  searchInput = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      this.searchInput = this.query;
      if (this.query) {
        this.productService.search(this.query).subscribe({
          next: (data) => this.results = data,
          error: () => alert('Kunde inte hämta sökresultat.')
        });
      }
    });
  }

  handleSearchSubmit(event: Event): void {
    event.preventDefault();
    const trimmed = this.searchInput.trim();
    if (trimmed) {
      this.router.navigate(['/search'], { queryParams: { q: trimmed } });
    }
  }
}