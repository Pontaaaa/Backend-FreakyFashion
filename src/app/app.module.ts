import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminProductsComponent } from './admin/products/admin-products/admin-products.component';
import { AdminNewProductComponent } from './admin/products/admin-new-product/admin-new-product.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { SpotsComponent } from './pages/home/spots/spots.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AdminProductsComponent,
    AdminNewProductComponent,
    ProductDetailsComponent,
    SearchResultsComponent,
    NotFoundComponent,
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    SpotsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
