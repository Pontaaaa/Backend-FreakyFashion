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
    this.route.paramMap.subscribe(params => {
      const newSlug = params.get('slug');
      if (newSlug) {
        this.slug = newSlug;
        this.loadProduct();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  loadProduct(): void {
    this.productService.getAll().subscribe((products) => {
      this.product = products.find(p => p.slug === this.slug) || null;
      this.similarProducts = products.filter(p => p.slug !== this.slug).slice(0, 6);

      document.title = this.product?.name ?? 'Freaky Fashion';
    });
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.search.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.search.trim() } });
    }
  }
  similarProductsGrouped(): Product[][] {
    const groups: Product[][] = [];
    for (let i = 0; i < this.similarProducts.length; i += 3) {
      groups.push(this.similarProducts.slice(i, i + 3));
    }
    return groups;
  }
}