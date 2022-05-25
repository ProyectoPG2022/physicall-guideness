import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  user$: Observable<any> = this.authSvc.afAuth.user;
  
  constructor(private authSvc: AuthService ) {
    if (!this.user$){
      const tab=document.getElementById("log").hidden=true;
    }
  }
  

}
