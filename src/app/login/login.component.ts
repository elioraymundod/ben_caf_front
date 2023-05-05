import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from '../Services/LoginService.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  datosFormGroup: UntypedFormGroup;
  public userValid: boolean;

  constructor(private _formBuilder: UntypedFormBuilder,
    private loginService: LoginService,
    private router: Router, private spinner: NgxSpinnerService) {
    this.userValid = false;

    this.datosFormGroup = this._formBuilder.group({
      loginFormControl: ['', [Validators.required]],
      passFormControl: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {

  }

  async iniciarSesion(datos: any) {
    this.spinner.show();
    const usuario = {
      "username": datos.loginFormControl,
      "password": datos.passFormControl
    }
    this.loginService.login(usuario)
      .subscribe((token) => {
        console.log('el token es', token)
        localStorage.setItem('token', token.accessToken);
        localStorage.setItem('role', token.roles[0])
        /*sessionStorage.setItem("accessToken", token.accessToken);
        sessionStorage.setItem("role", token.roles[0]);*/
        this.loginService.role = token.roles[0]
        const user = {
          login: token.username
        }
        this.loginService.getUser(user).subscribe((user) => {
          localStorage.setItem("idUser", user.idUsuario);
          if (token.roles[0] === 'ROLE_UMG_BC_AGRICULTOR') {
            this.router.navigate(['agricultor-main'])
          } else  if (token.roles[0] === 'ROLE_UMG_BC_BENEFICIO'){
            this.router.navigate(['beneficio-main'])
          } else  if (token.roles[0] === 'ROLE_UMG_BC_PESO_CABAL'){
            this.router.navigate(['peso-cabal-main'])
          }
        })
        this.spinner.hide()
        
      }, err => {
        this.spinner.hide()
        Swal.fire(
          'Usuario incorrecto',
          'El usuario y/o contraseña proporcionados son incorrectos, por favor validar',
          'error'
        )
      });
  }
  
}
