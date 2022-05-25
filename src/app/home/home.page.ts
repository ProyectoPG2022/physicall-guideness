import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MapServiceService } from '../map-service.service';
import * as L from 'leaflet'
import { MarkerService } from '../marker.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {

  public str_placeholder:string
  public items: any; //Lista donde buscará el buscador

  public lista = [{ id: 1, nombre: "Murcia" },
  { id: 2, nombre: "Compostela" },
  { id: 3, nombre: "Sevilla" },
  { id: 4, nombre: "Bilbao" },
  { id: 5, nombre: "León" },
  { id: 6, nombre: "Valladolid" }
  ]

  private map;

  constructor(public alertCtrl: AlertController, public mapService:MapServiceService, private markerService: MarkerService ) { 
  }

  private initMap(latitude, longitude):void{
    this.map = L.map('map', {
      center:[latitude, longitude],
      zoom: 3
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

  buscar(event){
    console.log(event)
  }

  options = {
    enablehighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
  async geolocalizador() {
    if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        
        this.initMap(latitude,longitude)

       await this.mapService.getCityByCoords({latitude, longitude}).then((ciudad) => console.log(ciudad))
       await this.markerService.makeCapitalMarkers(this.map)
        
      }, (err) => {
        console.warn('Error(' + err.code + '): ' + err.message)
      }, this.options)
    } else {
      alert("El navegador no soporta la geolocalización.")
    }
  }
}