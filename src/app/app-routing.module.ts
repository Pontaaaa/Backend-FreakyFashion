import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminProductsComponent } from './admin/products/admin-products/admin-products.component';
import { AdminNewProductComponent } from './admin/products/admin-new-product/admin-new-product.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products/:slug', component: ProductDetailsComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: 'admin/products', component: AdminProductsComponent },
  { path: 'admin/products/new', component: AdminNewProductComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
