import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MapServiceService } from '../map.service';
import * as L from 'leaflet'
import '../lib/L.Control.Range-min.js'
import { MarkerService } from '../marker.service';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { Viajero } from '../intefaces/viajero.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {

  user$: Observable<Viajero> = this.authSvc.user$;

  public str_placeholder: string

  private map: L.Map;
  public mapControl: L.Control.Layers

  public controlPoblacion: number
  public str_nombre_usuario: string
  public marcadorTemporal: L.Marker
  
  public editMap:boolean = false

  constructor(public alertCtrl: AlertController,
    public mapService: MapServiceService,
    private markerService: MarkerService,
    private authSvc: AuthService) {
    this.user$.subscribe((res) => {
      this.controlPoblacion = res.populationControl
      this.str_nombre_usuario = res.username
    })
  }

  async initMap(coords: L.LatLng) {
    // Se crea el mapa con un centro y un zoom predeterminado

    this.map = L.map('map', {
      center: coords,
      zoom: 9,
      zoomSnap: 0.5,  // Obliga al zoom a ser siempre un múltiplo del valor pasado
      zoomDelta: 0.5, // Obliga al zoom con la rueda que siempre se agregue o se reste la cantidad pasada por valor
      dragging: true, // Permite que el mapa sea "arrastrable"
      boxZoom: true,  // Permite hacer zoom con shift + "click izquierdo mantenido" para seleccionar la zona a la que haremos zoom
      minZoom: 6,     // El mínimo zoom al que se alejará el mapa
    }).on("click", <LeafletMouseEvent>(e: { latlng: L.LatLng; }) => {
      this.user$.subscribe(async (res) => {
        if (res.type == 'Guía' && this.editMap) {
          await this.markerService.crearMarcador(e.latlng, res.uid)
        }
      })

    })

    // Se crean unos detalles del mapa y se añaden
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 1,
      attribution: '&copy; <a href="http://www.ieschirinos.com/">I.E.S. Ginés Perez Chirinos</a>'
    }).addTo(this.map)

    // Se crea el control al que añadiremos las diferentes capas y lo añadimos al mapa
    this.mapControl = L.control.layers().addTo(this.map)


    // Se obtiene la layer con los marcadores de las ciudades con una población mayor al parámetro y se agrega al control
    console.log("Control de población: " + this.controlPoblacion)
    var layerGroup_CitiesGTPopulation = await this.markerService.getCitiesMarkersGTPopulation(this.map, this.controlPoblacion)
    this.mapControl.addOverlay(layerGroup_CitiesGTPopulation, "<span style='color: red'>Ciudades</span>")

    // Se obtienen los marcadores de firebase
    var marcadoresGuiasCercanos = await this.markerService.getMarkersFirebase(this.map)
    this.mapControl.addOverlay(marcadoresGuiasCercanos, "<span style='color: green'>Guias cercanos</span>")
    this.map.addControl(this.mapControl)

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

  buscar(event: any) {
    var busqueda = event.detail.value
    console.log("Buscar: " + busqueda)
    if (busqueda != '') {
      this.mapService.buscarCiudad(this.map, event.detail.value)
    } else {
      this.mapService.moveStart(this.map)
    }
  }

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
        var coords = new L.LatLng(latBullas, lngBullas)
        if(this.map == undefined) {
          await this.initMap(coords)
        }

      }, (err) => {
        console.warn('Error(' + err.code + '): ' + err.message)
      }, this.options)
    } else {
      alert("El navegador no soporta la geolocalización.")
    }
  }
}