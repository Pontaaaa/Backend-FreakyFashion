import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  search: string = '';

  constructor(private router: Router) {}

  handleSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.search.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.search } });
    }
  }
}