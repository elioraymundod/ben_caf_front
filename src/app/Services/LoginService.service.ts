import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
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

    public login(usuario: any): Observable<any> {
        return this.http.post(`${this.baseUrl}users/login`, usuario)
    }

    public getUser(usuario: any): Observable<any> {
        return this.http.post(`${this.baseUrl}users/user`, usuario)
    }

    public getPiloto(piloto: any): Observable<any> {
        return this.http.post(`${this.baseUrl}users/piloto`, piloto)
    }

    
    public obtenerValidezQR(solicitud: any): Observable<any> {
        return this.http.post(`${this.baseUrl}users/qrvalido`, solicitud)
    }

    public escanearQR(solicitud: any): Observable<any> {
        return this.http.put(`${this.baseUrl}users/escanearqr`, solicitud)
    }

}