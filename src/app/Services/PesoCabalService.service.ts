import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PesoCabalService {
    baseUrl: string;
    public userValid: boolean;
    public userLogged: string;
    public datosLogin: any;
    public role: any;
    public id: any;
    token: any ;
    headers: any;
    options: any;



    constructor(private http: HttpClient) {
        this.baseUrl = environment.baseUrl;
        this.userValid = false;
        this.userLogged = '';
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


    public ingresarPeso(peso: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}pesos/create`, peso, this.options)
    }

    public actualizarParcialidadIngresada(peso: any): Observable<any> {
        this.createHeader()
        return this.http.put(`${this.baseUrl}parcialidades/update`, peso, this.options)
    }

}