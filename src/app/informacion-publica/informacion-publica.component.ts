import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoginService } from '../Services/LoginService.service';
import * as CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-informacion-publica',
  templateUrl: './informacion-publica.component.html',
  styleUrls: ['./informacion-publica.component.css']
})
export class InformacionPublicaComponent implements OnInit {
  licenciaTransportista: any;
  informacionPiloto: any;
  public nombrePiloto = "";
  public licenciaPiloto = "";
  public numeroPiloto = "";
  public correoPiloto = "";
  public estadoPiloto = "";
  public noParcialidad: any = "";
  secretKey = "";
  public showInfo: boolean = false;

  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService, private loginService: LoginService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.secretKey = 'beneficiocafeencrypted'
    this.route.paramMap.subscribe(async params => {
      let licencia = params.get('transportista');
      let parcialidad = params.get('noParcialidad');
      let solicitud = params.get('solicitud');

      console.log('la licencia es ', licencia)
      console.log('la parcialidad es ', parcialidad)
      console.log('la solicitud es ', solicitud)



      const urlWithDiagonals = String(licencia).replace(/_/g, '/');
      const decryptedBytes = CryptoJS.AES.decrypt(urlWithDiagonals, this.secretKey);
      const decryptedParam = decryptedBytes.toString(CryptoJS.enc.Utf8);
/*
      const urlParcialidadWithDiagonals = String(parcialidad).replace(/_/g, '/'); 
      const decryptedBytesParcialidad = CryptoJS.AES.decrypt(urlParcialidadWithDiagonals, this.secretKey);
      const decryptedParamParcialidad = decryptedBytesParcialidad.toString(CryptoJS.enc.Utf8);*/

      this.licenciaTransportista = decryptedParam;
      
      let consultaPiloto = {
        "licencia": this.licenciaTransportista
      }

      let consultaSolicitud = {
        "solicitud": solicitud
      }

      this.loginService.obtenerValidezQR(consultaSolicitud).subscribe(res => {
        this.showInfo = res;
        if(res) {
          Swal.fire(
            'QR ya escaneado',
            'El QR que intentas consultar ya ha sido escaneado una vez.',
            'info'
          )
          this.spinner.hide();
        } else {
          this.loginService.getPiloto(consultaPiloto).subscribe(res => {
            this.nombrePiloto = res.nombre
            this.correoPiloto = res.correo
            this.numeroPiloto = res.celular
            this.licenciaPiloto = res.licenciaPiloto
            this.estadoPiloto = res.permitidoEnBeneficio === true ? "Transportista permitido" : "Transportista no permitido"
            this.noParcialidad = parcialidad;
            this.spinner.hide()

            this.loginService.escanearQR(consultaSolicitud).subscribe(res => {

            }, err => {
              Swal.fire(
                'Error',
                'Ocurrio un error al realizar la transaccion.',
                'error'
              )
              this.spinner.hide();
            })
          })
        }
      })
    })
  }

}
