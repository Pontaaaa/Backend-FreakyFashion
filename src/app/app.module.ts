import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminProductsComponent } from './admin/products/admin-products/admin-products.component';
import { AdminNewProductComponent } from './admin/products/admin-new-product/admin-new-product.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AdminProductsComponent,
    AdminNewProductComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
