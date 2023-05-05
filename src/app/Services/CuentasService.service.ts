import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CuentasService {
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


    public crearCuenta(cuenta: any): Observable<any> {
        this.createHeader()
        return this.http.post(`${this.baseUrl}cuentas/create`, cuenta, this.options)
    }

    
    public actualizarCuenta(cuenta: any): Observable<any> {
        this.createHeader()
        return this.http.put(`${this.baseUrl}cuentas/update`, cuenta, this.options)
    }
        
}