import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit,OnDestroy {
   user$: Observable<any>=this.authSvc.afAuth.user;

  constructor(private authSvc:AuthService,private router:Router) { }
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }

  async onSendEmail(): Promise<void>{
    try{
      await this.authSvc.sendVerificationEmail();
      this.router.navigate(['login']);
    }catch(error){
      console.log(error);
      this.router.navigate(['login']);
    } 
  }
  ngOnDestroy():void{
    this.authSvc.logout();
  }
}
