import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { finalize, switchMap } from 'rxjs/operators';
import { Usuario } from './intefaces/usuario.interface';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Viajero } from './intefaces/viajero.interface';
import { Guia } from './intefaces/guia.interface';
import { Archivo } from './intefaces/archivo.interface';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import Swal from 'sweetalert2';
import { Marcador } from './intefaces/marcador.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user$: Observable<Usuario>;
  private filePath: string;
  constructor(
    private strg: AngularFireStorage,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.afs.doc<any>(`usuarios/${user.uid}`).valueChanges();
        }
        return of(null);
      })
    );
  }

  //Método para resetear la contraseña del usuario
  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log(error);
    }
  }

  //Método para registro con google
  /*async loginGoogle():Promise<any>{
    try{
     const {user}= await this.afAuth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider());
     this.updateUserDataGoogle(user);
     return user;
    }catch(error){
      console.log(error);
    }
  }*/

  //Método de registro con email y contraseña
  async register(
    email: string,
    password: string,
    username: string,
    biografia: string,
    tipo: string
  ): Promise<any> {
    try {
      //Mete al usuario en firebase auth
      const user = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      const biografi = biografia;
      const type = tipo;

      this.saveUserData(user, username, biografi, type);
      await this.sendVerificationEmail();
      return user;
    } catch (error) {
      throw error;
      //console.log(error);
    }
  }

  //Método para mandar email de verificación
  async sendVerificationEmail(): Promise<void> {
    try {
      return (await this.afAuth.currentUser).sendEmailVerification();
    } catch (error) {
      console.log(error);
    }
  }
  async isEmailVerified(user: any) {
    if (await user.user.emailVerified) {
      return true;
    } else {
      return false;
    }
    //Con la asignación condicional no chuta y no se porque
    //return user.emailVerified = true ? true : false;
  }

  //Método de login con email y contraseña
  async login(email: string, password: string): Promise<any> {
    try {
      const user = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      this.updateUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //Método de cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      throw error;
      //console.log(error);
    }
  }
  private async updateUser(user: any) {
    return await this.afs
      .doc(`usuarios/${user.user.uid}`)
      .update({ emailVerified: user.user.emailVerified });
  }

  //Guarda el usuario en la base de datos
  private async saveUserData(
    user: any,
    nameuser: string,
    biografi: string,
    tipo: string
  ) {
    if (tipo == 'Viajero') {
      const userRef: AngularFirestoreDocument<Usuario> = this.afs.doc(
        `usuarios/${user.user.uid}`
      );
      var places: Marcador[] = [];

      places.push({ descripcion: `Casa de ${nameuser}`, userid: user.user.uid });
      const datos: Viajero = {
        uid: user.user.uid,
        username: nameuser,
        email: user.user.email,
        emailVerified: user.user.emailVerified,
        type: tipo,
        biografia: biografi,
        sitios: places,
        photo: '',
      };
      return await userRef.set(datos, { merge: true });
    }
    if (tipo == 'Guía') {
      const userRef: AngularFirestoreDocument<Usuario> = this.afs.doc(
        `usuarios/${user.user.uid}`
      );

      var places: Marcador[] = [];

      const datos: Guia = {
        uid: user.user.uid,
        username: nameuser,
        email: user.user.email,
        emailVerified: user.user.emailVerified,
        type: tipo,
        biografia: biografi,
        valoracionMedia: 0.0,
        sitios: places,
        photo: '',
      };
      return await userRef.set(datos, { merge: true });
    }
  }
  private async saveUserProfile(user: any) {
    //console.log('Usuario', user);
    try {
      const userRef: AngularFirestoreDocument<Usuario> = this.afs.doc(
        `usuarios/${user.uid}`
      );
      const datos = {
        username: user.username,
        biografia: user.biografia,
        photo: user.photo,
      };
      return await userRef.update(datos);
    } catch (error) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Algo ha ido mal :(',
        text: 'Por favor espere unos minutos es intentelo de nuevo',
      });
      body.classList.remove('swal2-height-auto');
    }
  }
  preSaveUserProfile(user: Usuario, image?: Archivo): void {
    if (image) {
      this.uploadImage(user, image);
    } else {
      this.saveUserProfile(user);
    }
  }
  private uploadImage(user: Usuario, image: Archivo): void {
    this.filePath = `imagenes/${image.name}`;
    const fileRef = this.strg.ref(this.filePath);
    const task = this.strg.upload(this.filePath, image);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((photoName) => {
            user.photo = photoName;
            this.saveUserProfile(user);
          });
        })
      )
      .subscribe();
  }
  public getOneGuia(id:string): Observable<Usuario> {
    return this.afs.doc<Usuario>(`usuarios/${id}`).valueChanges();
  }
}
