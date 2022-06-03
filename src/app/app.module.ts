import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';

import { HttpClientModule } from '@angular/common/http';
import { MarkerService } from './services/marker.service';
import { PopupComponent } from './popup/popup.component';

import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent, 
    PopupComponent // Para poder poner un componente en un popup
  ],
  entryComponents: [PopupComponent], // Para poder poner un componente en un popup
  imports: [
    CommonModule,
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,  
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule, 
    HttpClientModule
  ],
  providers: [
    { 
      provide: RouteReuseStrategy, 
      useClass: IonicRouteStrategy }, 
    MarkerService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {

  // Para poder poner un componente en un popup
  constructor(private injector: Injector) {
    const popupElement = createCustomElement(PopupComponent, {injector});
    // Registra el elemento personalizado en el buscador.
    customElements.define('popup-element', popupElement);
  }

}

