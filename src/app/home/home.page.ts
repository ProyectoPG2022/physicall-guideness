import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor() { }

  ngOnInit() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    searchButton.addEventListener('click', () => {
    const inputValue = searchInput.nodeValue;
    alert(inputValue);
});
  }

}
