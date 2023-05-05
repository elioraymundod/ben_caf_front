import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import Mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
 
Mapboxgl.accessToken = 'pk.eyJ1IjoiZWlyYXltdW4iLCJhIjoiY2w5ZG9vejhrNG1rMDNwdDVtanp0dmxuMiJ9.EBHCyXlDR8fonaAVzYG5jw';

if (!navigator.geolocation) {
  alert('El navegador no soporta la geolocalizacion')
  throw new Error('Navegador no soporta la Geolocation');
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
