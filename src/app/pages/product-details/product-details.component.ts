import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  slug = '';
  product: Product | null = null;
  similarProducts: Product[] = [];
  search = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.params['slug'];
    this.loadProduct();
  }

  loadProduct(): void {
    this.productService.getAll().subscribe((products) => {
      this.product = products.find(p => p.slug === this.slug) || null;
      this.similarProducts = products.filter(p => p.slug !== this.slug).slice(0, 6);

      if (this.product) {
        document.title = this.product.name;
      } else {
        document.title = 'Freaky Fashion';
      }
    });
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.search.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.search.trim() } });
    }
  }
}