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

  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService, private loginService: LoginService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.route.paramMap.subscribe(async params => {
      this.licenciaTransportista = params.get('transportista');
      
      let consultaPiloto = {
        "licencia": "https://beneficio-cafe-front.herokuapp.com/consulta-beneficio-cafe/piloto"+this.licenciaTransportista
      }
      this.loginService.getPiloto(consultaPiloto).subscribe(res => {
        this.informacionPiloto = res;
        console.log(this.informacionPiloto)
        this.spinner.hide()
      })


    })
  }

}
