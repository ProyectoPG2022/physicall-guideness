import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as firebase from 'firebase/compat/app';
import { switchMap } from 'rxjs/operators';
import { Usuario } from './intefaces/usuario.interface';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$:Observable<Usuario>;

  constructor(public afAuth:AngularFireAuth, private afs:AngularFirestore) { 
    this.user$ = this.afAuth.authState.pipe(switchMap((user)=>{
      if (user){
        return this.afs.doc<Usuario>(`usuarios/${user.uid}`).valueChanges();
      }
      return of(null);
    }));
  }
  /*usuario = this.auth.authState.pipe ( map (authState=>{
    if(authState){
      return authState;
    }else {
      return null;
    }
  }))*/

  //Método para resetear la contraseña del usuario
  async resetPassword(email:string):Promise<void>{
    try{
     return  this.afAuth.sendPasswordResetEmail(email);
    }catch(error){
      console.log(error);
    }
  }

  //Método para registro con google
  async loginGoogle():Promise<Usuario>{
    try{
     const {user}= await this.afAuth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider());
     this.updateUserData(user);
     return user;
    }catch(error){
      console.log(error);
    }
  }

  //Método de registro con email y contraseña
  async register(email:string ,password:string):Promise<Usuario>{
    try{
     const {user}= await this.afAuth.createUserWithEmailAndPassword(email,password);
     await this.sendVerificationEmail();
     return user;
    }catch(error){
      console.log(error);
    }
  }

  //Método para mandar email de verificación
  async sendVerificationEmail():Promise<void>{
    try{
      return (await this.afAuth.currentUser).sendEmailVerification();
    }catch(error){
      console.log(error);
    }
  }
  isEmailVerified(user:Usuario){
    if(user.emailVerified){
      return true;
    }else{
      return false;
    }
    //return user.emailVerified = true ? true : false;
  }

  //Método de registro con email y contraseña 
  async login(email:string ,password:string):Promise<Usuario>{
    try{
     const {user}= await this.afAuth.signInWithEmailAndPassword(email,password);
     this.updateUserData(user);
     return user;
    }catch(error){
      console.log(error);
    }
  }

  //Método de cerrar sesión
  async logout():Promise<void>{
    try{
      await this.afAuth.signOut();
    }catch(error){
      console.log(error);
    }
  }
  private updateUserData(user:Usuario){
    const userRef:AngularFirestoreDocument<Usuario> = this.afs.doc(`usuarios/${user.uid}`);
    const datos:Usuario={
      uid:user.uid,
      displayName:user.displayName,
      email:user.email,
      emailVerified: user.emailVerified
      /*biografia:usuario.biografia,
      contrasena:usuario.contrasena,
      foto:usuario.foto,
      username:usuario.username*/
    }
    return userRef.set(datos,{merge:true});
  }
}
