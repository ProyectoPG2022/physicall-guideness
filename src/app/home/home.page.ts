import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MapServiceService } from '../map-service.service';
import * as L from 'leaflet'
import { MarkerService } from '../marker.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {

  public str_placeholder: string

  private map;

  constructor(public alertCtrl: AlertController, public mapService: MapServiceService, private markerService: MarkerService) {
  }

  async initMap(latitude: number, longitude: number) {
    this.map = L.map('map', {
      center: [latitude, longitude],
      zoom: 9
    })

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 1,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a><br/> <a href="http://www.ieschirinos.com/">I.E.S. Ginés Perez Chirinos</a>'
    })

    tiles.addTo(this.map)
  }

  ngAfterViewInit(): void {
    this.geolocalizador()
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
        var marcadores = await this.markerService.getCitiesMarkersGTPopulation(50000)

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