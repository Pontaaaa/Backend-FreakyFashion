import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  accordionSections = [
    {
      id: 'Shopping',
      title: 'Shopping',
      links: ['T-shirts', 'Hoodies', 'Toppar']
    },
    {
      id: 'MinaSidor',
      title: 'Mina Sidor',
      links: ['Mitt konto', 'Beställningar', 'Returnera artikel']
    },
    {
      id: 'Kundtjanst',
      title: 'Kundtjänst',
      links: ['Kontakta oss', 'Köpvillkor', 'Returpolicy']
    }
  ];

  bottomSections = [
    {
      id: 'shoppingList',
      title: 'Shopping',
      links: ['T-shirts', 'Skor', 'Hoodies']
    },
    {
      id: 'myPagesList',
      title: 'Mina sidor',
      links: ['Mitt konto', 'Beställningar', 'Returnera artikel']
    },
    {
      id: 'customerServiceList',
      title: 'Kundtjänst',
      links: ['Kontakta oss', 'Köpvillkor', 'Returpolicy']
    }
  ];
}