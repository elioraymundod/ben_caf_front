import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SolicitudesService {
    baseUrl: string;
    token: any ;
    headers: any;
    options: any;


    constructor(private http: HttpClient) {
        this.token = '';
        this.headers = null;
        this.options = null;

        this.token =  localStorage.getItem('token');
        this.headers = new HttpHeaders({
            'Authorization': `Bearer ${this.token}`
        })
        this.options = { headers: this.headers };
        this.baseUrl = environment.baseUrl;
    }

    public createHeader(){
        this.token = '';
        this.headers = null;
        this.options = null;

        this.token =  localStorage.getItem('token');
        this.headers = new HttpHeaders({
            'Authorization': `Bearer ${this.token}`
        })
        this.options = { headers: this.headers };
        this.baseUrl = environment.baseUrl;
    }


    public crearsolicitud(solicitud: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}solicitud/create`, solicitud, this.options)
    }

    public getSolicitudesByUsuario(solicitud: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}solicitud/agricultor`, solicitud, this.options)
    }

    public getSolicitudesByEstado(estado: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}solicitud/estado`, estado, this.options)
    }

    public validarSolicitud(solicitud: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}solicitud/validate`, solicitud, this.options)
    }

    public actualizarSolicitud(solicitud: any): Observable<any> {
        this.createHeader()
        return this.http.put(`${this.baseUrl}solicitud/update`, solicitud, this.options)
    }

    public actualizarSolicitudAgricultor(solicitud: any): Observable<any> {
        this.createHeader()
        return this.http.put(`${this.baseUrl}solicitud/update/agricultor`, solicitud, this.options)
    }

    public consultarDisponibilidadParcialidades(solicitud: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}parcialidades/cantidad`, solicitud, this.options)
    }

    public crearParcialidad(parcialidad: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}parcialidades/create`, parcialidad, this.options)
    }

    public obtenerParcialidadesRevisionPesoCabal(estado: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}parcialidades/revision`, estado, this.options)
    }

    public validarFaltantesSobrantes(solicitud: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}solicitud/faltantes/sobrantes`, solicitud, this.options)
    }

    public crearAnexo(anexo: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}anexos/create`, anexo, this.options)
    }

    public crearRechazo(rechazo: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}rechazos/create`, rechazo, this.options)
    }

        
}