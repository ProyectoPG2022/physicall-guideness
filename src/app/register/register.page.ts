import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(private authSvc:AuthService,private router:Router) { }

  ngOnInit() {
  }
  async onRegister(email,password){
    try{
      const user=await this.authSvc.register(email.value,password.value);
      if(user){
        //Todo CheckMail
        const isVerified=this.authSvc.isEmailVerified(user);
        this.redirectUser(isVerified);
      }
    }catch(error){
      console.log(error)
    }
  }
  private redirectUser(isVerified:boolean):void{
    if(isVerified){
      this.router.navigate(['home']);
    }else{
      this.router.navigate(['verify-email']);
    }
  }
}
