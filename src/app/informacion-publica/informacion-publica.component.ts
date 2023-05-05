import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoginService } from '../Services/LoginService.service';

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

  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService, private loginService: LoginService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.route.paramMap.subscribe(async params => {
      this.licenciaTransportista = params.get('transportista');
      console.log(this.licenciaTransportista)
      let consultaPiloto = {
        "licencia": this.licenciaTransportista
      }
      this.loginService.getPiloto(consultaPiloto).subscribe(res => {
        this.nombrePiloto = res.nombre
        this.correoPiloto = res.correo
        this.numeroPiloto = res.celular
        this.licenciaPiloto = res.licenciaPiloto
        this.estadoPiloto = res.permitidoEnBeneficio === true ? "Transportista permitido" : "Transportista no permitido"
        this.spinner.hide()
      })


    })
  }

}
