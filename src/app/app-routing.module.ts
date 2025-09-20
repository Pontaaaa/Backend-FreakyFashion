import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AdminProductsComponent } from './admin/products/admin-products/admin-products.component';
import { AdminNewProductComponent } from './admin/products/admin-new-product/admin-new-product.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LayoutComponent } from './layout/layout/layout.component';

import { AdminCategoriesListComponent } from './admin/categories/admin-categories/admin-categories-list-component';
import { AdminCategoryFormComponent } from './admin/categories/admin-new-categories/admin-categories-form-component';

const routes: Routes = [
  { path: 'admin/products', component: AdminProductsComponent },
  { path: 'admin/products/new', component: AdminNewProductComponent },
  { path: 'admin/products/:id', component: AdminNewProductComponent },

  { path: 'admin/categories', component: AdminCategoriesListComponent },
  { path: 'admin/categories/new', component: AdminCategoryFormComponent },
  { path: 'admin/categories/:id', component: AdminCategoryFormComponent },

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products/:slug', component: ProductDetailsComponent },
      { path: 'search', component: SearchResultsComponent },

      {
        path: 'category/:slug',
        loadComponent: () =>
          import('./pages/category/category-page.component').then(m => m.CategoryPageComponent)
      },

      { path: '**', component: NotFoundComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}