import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MapServiceService } from '../services/map.service';
import * as L from 'leaflet'
import { MarkerService } from '../services/marker.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { v4 as uuidv4 } from 'uuid'
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {

  user$: Observable<any> = this.authSvc.user$;

  public str_placeholder: string

  private map: L.Map;
  public mapControl: L.Control.Layers

  public controlPoblacion: number
  public str_nombre_usuario: string
  public marcadorTemporal: L.Marker
  public userActual: any

  public editMap: boolean = false

  constructor(public alertCtrl: AlertController,
    public mapService: MapServiceService,
    private markerService: MarkerService,
    private authSvc: AuthService,
    private afs: AngularFirestore,
    private router: Router) {
    this.user$.subscribe((res) => {
      this.controlPoblacion = res.populationControl
      this.str_nombre_usuario = res.username
      this.userActual = res
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
    }).on("click", async <LeafletMouseEvent>(e: { latlng: L.LatLng; }) => {
      if (this.userActual.type == 'Guía' && this.editMap) {
        const uid = uuidv4()
        await this.markerService.addMarcadorToGuia(this.userActual, uid)
        await this.markerService.crearMarcador(e.latlng, this.userActual, uid)
      }
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
        //const latBullas = 38.0467272
        //const lngBullas = -1.7229798
        // cambiar estos números por latitude y longitud
        var coords = new L.LatLng(latitude, longitude)
        if (this.map == undefined) {
          await this.initMap(coords)
        }

      }, (err) => {
        console.warn('Error(' + err.code + '): ' + err.message)
      }, this.options)
    } else {
      alert("El navegador no soporta la geolocalización.")
    }
  }

  onLogOut() {
    try {
      const body = document.getElementsByTagName('body')[0];

      Swal.fire({
        title: '¿Estas seguro?',
        text: 'Una vez cerrada sesión habrá que volver a iniciar sesión',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Cerrar sesión',
        
      }).then((result) => {
        if (result.isConfirmed) {
          
          this.authSvc.logout();

          const body = document.getElementsByTagName('body')[0];
          Swal.fire({
            icon: 'success',
            text: 'Se ha cerrado sesión correctamente',
          });
          body.classList.remove('swal2-height-auto');

          this.router.navigate(['login']);
        }
      });
      body.classList.remove('swal2-height-auto');
    } catch (error) {
      const body = document.getElementsByTagName('body')[0];
      Swal.fire({
        icon: 'error',
        title: 'Ha ocurrido un error al cerrar sesión',
        text: 'Por favor, vuelva a intentarlo',
      });
      body.classList.remove('swal2-height-auto');
    }
  }
}