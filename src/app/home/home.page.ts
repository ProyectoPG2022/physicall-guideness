import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  /*Para poder sacar el usuario de la bd hay que hacer un observable y devolver lo que encuentre*/
  user$: Observable<any>=this.authSvc.afAuth.user;
  constructor(private afAuth:AngularFireAuth ,private authSvc:AuthService,private afs: AngularFirestore) { 
    this.user$ = this.afAuth.authState.pipe(switchMap((user)=>{
      if (user){
        return this.afs.doc<any>(`usuarios/${user.uid}`).valueChanges();
      }
      return of(null);
    }));
  }
   onLogOut(){
     this.authSvc.logout();
  }

  ngOnInit() {
    
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    searchButton.addEventListener('click', () => {
    const inputValue = searchInput.nodeValue;
    alert(inputValue);
    
});
  }

}
