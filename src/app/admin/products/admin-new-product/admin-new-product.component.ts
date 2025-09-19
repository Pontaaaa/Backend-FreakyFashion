import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, Category, Product } from 'src/app/services/product.service';

@Component({
  selector: 'app-admin-new-product',
  templateUrl: './admin-new-product.component.html',
  styleUrls: ['../../../../assets/styles/admin.css']
})
export class AdminNewProductComponent implements OnInit {
  title = 'Ny produkt';

  // create/edit toggle
  isEdit = false;
  id?: number;

  // categories for checkboxes
  categories: Category[] = [];
  selectedCategoryIds = new Set<number>();

  formData: any = {
    name: '',
    description: '',
    brand: '',
    sku: '',
    price: '',
    publicationDate: '',
    image: null
  };

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // load categories for the checkbox list
    this.productService.getCategories().subscribe({
      next: (cats) => (this.categories = cats)
    });

    // OPTIONAL: support edit mode if you later add route /admin/products/:id
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.title = 'Redigera produkt';

      this.productService.getById(this.id).subscribe((p: Product) => {
        // prefill form fields
        this.formData.name = p.name;
        this.formData.description = p.description;
        this.formData.brand = p.brand;
        this.formData.sku = p.sku;
        this.formData.price = String(p.price);
        this.formData.publicationDate = p.publicationDate;

        // preselect categories if backend returns them
        if (p.categories?.length) {
          p.categories.forEach(c => this.selectedCategoryIds.add(c.id));
        }
      });
    }
  }

  handleChange(event: any) {
    const { name, value, type, files } = event.target;
    this.formData[name] = type === 'file' ? files[0] : value;
  }

  // called from template checkboxes
  toggleCategory(id: number, checked: boolean) {
    if (checked) this.selectedCategoryIds.add(id);
    else this.selectedCategoryIds.delete(id);
  }
  // for [checked] binding
  isSelected(id: number) {
    return this.selectedCategoryIds.has(id);
  }

  handleSubmit(event: Event) {
    event.preventDefault();

    const form = new FormData();
    for (const key in this.formData) {
      if (this.formData[key] !== null && this.formData[key] !== undefined) {
        form.append(key, this.formData[key]);
      }
    }

    // append selected category ids as JSON string
    const categoryIds = Array.from(this.selectedCategoryIds.values());
    form.append('categoryIds', JSON.stringify(categoryIds));

    if (this.isEdit && this.id != null) {
      this.productService.updateProduct(this.id, form).subscribe({
        next: (res) => {
          alert(res.message || 'Produkten uppdaterad.');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          alert(err.error?.message || 'Kunde inte uppdatera produkten.');
        }
      });
    } else {
      this.productService.createProduct(form).subscribe({
        next: (res) => {
          alert(res.message || 'Produkten har lagts till!');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          alert(err.error?.message || 'Något gick fel vid sparning av produkten.');
        }
      });
    }
  }
}