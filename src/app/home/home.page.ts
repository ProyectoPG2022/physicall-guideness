import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MapServiceService } from '../map-service.service';
import * as L from 'leaflet'
import { MarkerService } from '../marker.service';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { Marcador } from '../intefaces/marcador.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {

  user$$: Observable<any> = this.authSvc.afAuth.user;

  public str_placeholder: string

  private map: L.LayerGroup<any> | L.Map;
  public mapControl : L.Control.Layers
  
  public controlPoblacion: number


  constructor(public alertCtrl: AlertController,
    public mapService: MapServiceService,
    private markerService: MarkerService,
    private authSvc: AuthService) {
    this.controlPoblacion = 20000
  }

  async initMap(latitude: number, longitude: number) {
    // Se crea el mapa con un centro y un zoom predeterminado
    this.map = L.map('map', {
      center: [latitude, longitude],
      zoom: 9
    })

    // Se crean unos detalles del mapa y se añaden
    const copyright = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 1,
      attribution: '&copy; <a href="http://www.ieschirinos.com/">I.E.S. Ginés Perez Chirinos</a>'
    }).addTo(this.map)

    // Se crea el control al que añadiremos las diferentes capas y lo añadimos al mapa
    this.mapControl = L.control.layers().addTo(this.map)

    // Se obtiene la layer con los marcadores de las ciudades con una población mayor al parámetro y se agrega al control
    var layerGroup_CitiesGTPopulation = await this.markerService.getCitiesMarkersGTPopulation(this.controlPoblacion)
    this.mapControl.addOverlay(layerGroup_CitiesGTPopulation, "<span style='color: gray'>Ciudades</span>")

    // Se obtienen los marcadores de firebase
    var marcadores = await this.markerService.getMarkersFirebase()
    this.mapControl.addOverlay(marcadores, "<span style='color: gray'>Guias cercanos</span>")
  }

  ngAfterViewInit(): void {
    //Comprobar antes de lanzar esta función si está el usuario logueado o no
    this.authSvc.user$.subscribe(() => {
      this.geolocalizador()
    })
  }

  ngOnInit() {
    this.str_placeholder = "¿A dónde quieres ir?"
  }

  /*buscar(event) {
    console.log(event)
  }*/

  options = {
    enablehighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
  async geolocalizador() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        const latBullas = 38.0467272
        const lngBullas = -1.7229798
        // cambiar estos números por latitude y longitud
        await this.initMap(latBullas, lngBullas)

        let city = await this.mapService.getCityByCoords(latBullas, lngBullas)

        console.log(city)
      }, (err) => {
        console.warn('Error(' + err.code + '): ' + err.message)
      }, this.options)
    } else {
      alert("El navegador no soporta la geolocalización.")
    }
  }
}