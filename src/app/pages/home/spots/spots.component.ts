import { Component } from '@angular/core';

@Component({
  selector: 'app-spots',
  templateUrl: './spots.component.html',
  styleUrls: ['./spots.component.css']
})
export class SpotsComponent {
  spots = [
    {
      image: 'assets/images/pexels-jonaorle-3828245.jpg',
      text: 'Lorem, ipsum dolor',
      link: ''
    },
    {
      image: 'assets/images/pexels-callmehuyuno-347917.jpg',
      text: 'Lorem, ipsum dolor',
      link: ''
    },
    {
      image: 'assets/images/pexels-ralph-rabago-3214683.jpg',
      text: 'Lorem, ipsum dolor',
      link: ''
    }
  ];
}
