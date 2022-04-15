import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private authSvc:AuthService, private router:Router) { }

  ngOnInit() {
  }
  async onLogin(email,password){
    try{
      const user= await this.authSvc.login(email.value,password.value);
      if(user){
        //Todo: Chekemail
        const isVerified = this.authSvc.isEmailVerified(user);
        //Comprobamos que es la primera vez que inicia sesión
       // const isFirstTime = this.authSvc.isFirstTime(user);
        this.redirectUser(isVerified);
      }
    }catch(error){
      console.log(error);
    }
  }
  
  /*async onLoginGoogle(){
    try{
      const user = await this.authSvc.loginGoogle();
      if(user){
        const isVerified=this.authSvc.isEmailVerified(user);
        this.redirectUser(isVerified);
        //Todo: Chekemail
      }
    }catch(error){
      console.log(error);
    };
  }*/
  private redirectUser(isVerified:boolean):void{
    if(isVerified){
      this.router.navigate(['home']);
    }else{
      this.router.navigate(['verify-email']);
    }
  }
}
