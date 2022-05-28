import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Guia } from '../intefaces/guia.interface';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.page.html',
  styleUrls: ['./public-profile.page.scss'],
})
export class PublicProfilePage implements OnInit {
  userGuia$: Observable<any>;
  //
  public paragraph;
  public userPlaces;
  public userType;
  constructor(
    private authSvc: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params.id;
    this.userGuia$ = this.authSvc.getOneGuia(id);
    this.userGuia$.subscribe((user) => {
      this.fillStars(user);
      this.userPlaces = user.sitios;
      this.userType = user.type;
    });
  }

  private fillStars(user: Guia): void {
    /*if (user.type == 'Guía') {
      const rating = user.valoracionMedia;

      for (let j = 1; j <= rating; j++) {
        document.getElementById(j + 'star').style.color = 'orange';
      }
    }*/

    //   for (let i = 1; i <= rating; i++) {
    //     const bu=document.getElementById(i + 'star');
    //     bu.style.color = 'orange';
    //   }

    //   if (!this.paragraph) {
    //     this.paragraph = document
    //       .getElementById('starsContainer')
    //       .appendChild(document.createElement('p'));
    //     this.paragraph.textContent = '' + rating;
    //   }
    // }
  }
}
