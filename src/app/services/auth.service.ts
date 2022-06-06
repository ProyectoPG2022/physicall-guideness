import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { finalize, switchMap } from 'rxjs/operators';
import { Usuario } from '../interfaces/usuario.interface';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { Viajero } from '../interfaces/viajero.interface';
import { Guia } from '../interfaces/guia.interface';
import { Archivo } from '../interfaces/archivo.interface';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user$: Observable<any>;
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
      //console.log(error);
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Algo ha ido mal :(',
        text: 'Error al mandar correo de reseteo de contraseña, por favor vuelva a intentarlo',
      });
      body.classList.remove('swal2-height-auto');
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
      //console.log(error);
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Algo ha ido mal :(',
        text: 'Error al mandar correo de verificación, por favor vuelva a intentarlo',
      });
      body.classList.remove('swal2-height-auto');
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
    var places: string[] = [];

    if (tipo == 'Viajero') {
      const userRef: AngularFirestoreDocument<Usuario> = this.afs.doc(
        `usuarios/${user.user.uid}`
      );

      const datos: Viajero = {
        uid: user.user.uid,
        username: nameuser,
        email: user.user.email,
        emailVerified: user.user.emailVerified,
        type: tipo,
        biografia: biografi,
        sitios: places,
        photo: '',
        populationControl: 10000,
      };
      return await userRef.set(datos, { merge: true });
    }
    if (tipo == 'Guía') {
      const userRef: AngularFirestoreDocument<Usuario> = this.afs.doc(
        `usuarios/${user.user.uid}`
      );

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
        populationControl: 10000,
        coments: [],
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
        populationControl: user.populationControl,
      };
      return await userRef.update(datos);
    } catch (error) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Algo ha ido mal :(',
        text: 'Error al guardar los datos del usuario, por favor, espere unos minutos e intentelo de nuevo',
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
  public getOne(id: string): Observable<any> {
    return this.afs.doc<any>(`usuarios/${id}`).valueChanges();
  }
}
