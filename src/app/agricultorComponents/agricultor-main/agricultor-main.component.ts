import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CuentasService } from 'src/app/Services/CuentasService.service';
import { LoginService } from 'src/app/Services/LoginService.service';
import { SolicitudesService } from 'src/app/Services/SolicitudesService.service';
import Swal from 'sweetalert2';
declare let $: any;
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-agricultor-main',
  templateUrl: './agricultor-main.component.html',
  styleUrls: ['./agricultor-main.component.css']
})
export class AgricultorMainComponent implements OnInit {
  dataSource = new MatTableDataSource();
  columnsToDisplay: any = [];
  columnsChildrenIds: any = [];
  controlesFormGroup: FormGroup;
  controlesSecundariosFormGroup: FormGroup;
  tituloFormulario = '';
  tituloModalSecundario = '';
  controles: any;
  controlesModalSecundario: any = [];
  opcionesMenu;
  botonesFooter: any;
  botonesSecundarios: any;
  botonesModalSecundario: any = [];
  showTable = false;
  idUsuario: any;
  public myAngularxQrCode: string = 'beneficio-cafe';
  public qrCodeDownloadLink: SafeUrl = "";

  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;

  constructor(private spinner: NgxSpinnerService, private loginService: LoginService, private router: Router, private solicitudesService: SolicitudesService, private cuentasService: CuentasService) {
    this.controlesFormGroup = new FormGroup({});
    this.controlesSecundariosFormGroup = new FormGroup({});

    const opciones = [];
    opciones.push(
      {
        tituloSeccion: '', class: 'carousel-item active',
        opciones:
          [
            { nombre: 'Crear solicitud', descripcion: 'Crear una solicitud al Beneficio del Cafe', icono: 'library_add', accion: 'crearSolicitud' },
            { nombre: 'Solicitudes realizadas', descripcion: 'Ver solicitudes en proceso', icono: 'playlist_add_check', accion: 'verSolicitudes' },
            { nombre: 'Cerrar sesión', descripcion: 'Cerrar sesión', icono: 'power_settings_new', accion: 'cerrarSesion' },
          ]
      }
    )
    this.opcionesMenu = opciones;
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

  descargarQr(datos: any){
    const nitPiloto = datos.piloto;
    const secretKey = 'beneficiocafeencrypted'
    const encriyptedParam = CryptoJS.AES.encrypt(nitPiloto, secretKey).toString();
    this.myAngularxQrCode = `https://beneficio-cafe-front.herokuapp.com/consulta-beneficio-cafe/${encriyptedParam}`
    $('#opcionesGenerales').modal('hide');
    $('#verCarnetTransportista').modal('show');
  }

  ngOnInit(): void {
    this.spinner.show();

    if (localStorage.getItem('role') !== 'ROLE_UMG_BC_AGRICULTOR') {
      this.spinner.hide();
      this.router.navigate(['login']);
    }
    this.idUsuario = localStorage.getItem('idUser');
    this.spinner.hide();
  }

  openDialog(accion: any) {
    setTimeout(() => this.dataSource.paginator = this.paginator);
    switch (accion) {
      case 'crearSolicitud':
        this.tituloFormulario = 'Creacion de Solicitud'
        $('#opcionesGenerales').modal('show');
        break;

      case 'verSolicitudes':
        this.tituloFormulario = 'Ver solicitudes en proceso'
        $('#opcionesGenerales').modal('show');
        break;

      case 'cerrarSesion':
        this.cerrarSesion();
        break;
    }
    this.generarControles(accion);
  }

  generarControles(accion: any) {
    let controles = []
    let botonesFooter = []
    switch (accion) {
      case 'crearSolicitud':
        this.spinner.show()
        controles.push(
          {
            tituloStep: 'Informacion nueva solicitud',
            controles: [
              {
                id: 'descripcion', nombrefila: 'Descripción solicitud', formControl: new FormControl('', Validators.required), change: false,
                tipo: 'input', nombre: 'Descripción de la solicitud', maxLength: 100, class: 'col-8', restclass: '', divider: true,

              },
              {
                id: 'placa', nombrefila: 'Información del transporte', formControl: new FormControl('', Validators.required), change: false,
                tipo: 'input', nombre: 'Placa del transporte', maxLength: 15, class: 'col-4', restclass: 'col-4', divider: true,
                controlesComplemento: [{ id: 'piloto', formControl: new FormControl('', Validators.required), tipo: 'input', nombre: 'Licencia del piloto asignado', maxLength: 15, class: 'col-12', change: false }]
              },
              {
                id: 'parcialidades', nombrefila: 'Parcialidades a enviar', formControl: new FormControl('', Validators.required), change: false, keypress: true,
                tipo: 'input', nombre: 'Cantidad de parcialidades a enviar', maxLength: 3, class: 'col-4', restclass: 'col-4', divider: true,
              },
            ],
          }
        )
        botonesFooter.push(
          { nombre: 'Cancelar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
          { nombre: 'Guardar', icono: 'save', class: 'btn-container mt-2 ml-2', click: () => this.crearSolicitud(), disable: true },
        )
        this.spinner.hide()
        break;

      case 'verSolicitudes':
        this.spinner.show();
        this.columnsToDisplay = [{ id: 'descripcion', displayName: 'Descripción' }, { id: 'noCuenta', displayName: 'No. Cuenta' }, { id: 'estado', displayName: 'Estado solicitud' },
        {
          id: 'accion', displayName: 'Acción', icono: 'remove_red_eye', titleAccion: 'Ver tracking', accion: (element: any) => this.verTracking(element),
          secondIcon: 'local_shipping', secondTitleAccion: 'Enviar parcialidad', secondAccion: (element: any) => this.ingresarParcialidad(element)
        }]
        this.columnsChildrenIds = ['descripcion', 'noCuenta', 'estado', 'accion']
        controles.push(
          {
            tituloStep: 'Visualizacion solicitudes creadas',
            controles: [
              /*{
                id: 'placa', nombrefila: 'Información del transporte', formControl: new FormControl('', Validators.required), change: false,
                tipo: 'input', nombre: 'Placa del transporte', maxLength: 15, class: 'col-4', restclass: 'col-4', divider: true,
                controlesComplemento: [{ id: 'piloto', formControl: new FormControl('', Validators.required), tipo: 'input', nombre: 'Licencia del piloto asignado', maxLength: 15, class: 'col-12', change: false }]
              },
              {
                id: 'parcialidades', nombrefila: 'Parcialidades a enviar', formControl: new FormControl('', Validators.required), change: false, keypress: true,
                tipo: 'input', nombre: 'Cantidad de parcialidades a enviar', maxLength: 3, class: 'col-4', restclass: 'col-4', divider: true,
              },*/
            ],
          }
        )

        const usuario = {
          "usuario": this.idUsuario
        }
        this.solicitudesService.getSolicitudesByUsuario(usuario).subscribe(res => {
          this.showTable = true;
          this.dataSource.data = res;
          console.log(res)
          setTimeout(() => this.dataSource.paginator = this.paginator);
          this.spinner.hide()
        }, err => {
          this.spinner.hide();
        })
        botonesFooter.push(
          { nombre: 'Cerrar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
        )
        break;
    }
    this.controles = controles;
    this.botonesFooter = botonesFooter;
    this.controles.forEach((controlesStep: any) => {
      controlesStep.controles.forEach((element: any) => {
        if (element.controlesComplemento) {
          element.controlesComplemento.forEach((e: any) => {
            this.controlesFormGroup.addControl(e.id, e.formControl);
          })
        }
        this.controlesFormGroup.addControl(element.id, element.formControl);
      })
    })
    this.controlesFormGroup.updateValueAndValidity();
  }

  ingresarParcialidad(parcialidad: any) {
    console.log(parcialidad)
    this.spinner.show();
    this.tituloModalSecundario = 'Ingreso de parcialidades'
    let botones: any = [];
    let consultaParcialidades = {
      "solicitud": parcialidad.idSolicitud
    }
    this.solicitudesService.consultarDisponibilidadParcialidades(consultaParcialidades).subscribe(res => {
      this.controlesModalSecundario.push(
        {
          id: 'piloto', nombrefila: 'Informacion transporte', formControl: new FormControl({ value: '', disabled: true }, Validators.required),
          tipo: 'input', nombre: 'Piloto', class: 'col-5', restclass: '3', maxLength: 15,
          controlesComplemento: [{
            id: 'placa', formControl: new FormControl({ value: '', disabled: true }, Validators.required), tipo: 'input',
            nombre: 'Placa', class: 'col-12'
          }]
        },
        {
          id: 'peso', nombrefila: 'Peso enviado', formControl: new FormControl({ value: '', disabled: false }, Validators.required),
          tipo: 'input', nombre: 'Peso de la parcialidad a enviar (medida en toneladas)', class: 'col-5', restclass: '3', maxLength: 3, keypress: true,
          controlesComplemento: [{ id: 'noParcialidad', formControl: new FormControl({ value: '', disabled: true }), tipo: 'input', nombre: 'Número de parcialidad', class: 'col-12' }]
        },
      )

      this.controlesModalSecundario.forEach((element: any) => {
        if (element.controlesComplemento) {
          element.controlesComplemento.forEach((e: any) => {
            this.controlesSecundariosFormGroup.addControl(e.id, e.formControl);
          })
        }
        this.controlesSecundariosFormGroup.addControl(element.id, element.formControl);
      });
      this.controlesSecundariosFormGroup.updateValueAndValidity();

      this.controlesSecundariosFormGroup.get('placa')?.setValue(parcialidad.placa)
      this.controlesSecundariosFormGroup.get('piloto')?.setValue(parcialidad.piloto)
      this.controlesSecundariosFormGroup.get('noParcialidad')?.setValue(Number(res.message) + 1)
      this.spinner.hide()
    }, err => {
      this.spinner.hide();
      Swal.fire(
        'Error',
        'No fue posible realizar lo solicitado, por favor intentente en otro momento',
        'error'
      )
    })


    botones.push(
      { nombre: 'Regresar', icono: 'arrow_back', class: 'btn-container mt-2 ml-2', click: () => this.regresar() },
      { nombre: 'Enviar parcialidad', icono: 'local_shipping', class: 'btn-container mt-2 ml-2', click: () => this.enviarParcialidad(parcialidad), disabled: true }

    )

    this.botonesModalSecundario = botones;

    $('#opcionesGenerales').modal('hide');
    $('#modalSecundary').modal('show');
  }

  enviarParcialidad(parcialidad: any) {
    this.spinner.show()
    let nuevaParcialidad = {
      "solicitud": parcialidad.idSolicitud,
      "pesoEnviado": Number(this.controlesSecundariosFormGroup.get('peso')?.value),
      "placa": parcialidad.placa,
      "piloto": parcialidad.piloto,
      "usuarioCreacion": this.idUsuario
    }

    this.solicitudesService.crearParcialidad(nuevaParcialidad).subscribe(res => {
      let nuevoEstado = {
        "solicitud": parcialidad.idSolicitud,
        "nuevoEstado": "55891e4a-ea98-11ed-a05b-0242ac120003",
        "usuarioModificacion": this.idUsuario,
        "fechaModificacion": new Date()
      }

      let noParcialidad = Number(this.controlesSecundariosFormGroup.get('noParcialidad')?.value)
      if (noParcialidad === 1) {

        // Cambiar estado de solicitud a Cuenta Abierta
        this.solicitudesService.actualizarSolicitudAgricultor(nuevoEstado).subscribe(res => {
          Swal.fire(
            'Parcialidad enviada',
            'Se envió la parcialidad con éxito al Beneficio del Café',
            'success'
          )
          this.spinner.hide();

          $('#modalSecundary').modal('hide');
          $('#opcionesGenerales').modal('hide');
          this.cleanForm();
        }, err => {
          this.spinner.hide();
          Swal.fire(
            'Error',
            'No fue posible realizar lo solicitado, por favor intentente en otro momento',
            'error'
          )
        })

        // Cambiar estado de cuenta a Cuenta Abierta
        let nuevoEstadoCuenta = {
          "idCuenta": parcialidad.idCuenta,
          "nuevoEstado": "55891e4a-ea98-11ed-a05b-0242ac120003",
          "usuarioModificacion": this.idUsuario
        }
        this.cuentasService.actualizarCuenta(nuevoEstadoCuenta).subscribe(res => {
          this.spinner.hide()
        }, err => {
          this.spinner.hide()
          Swal.fire(
            'Error',
            'No fue posible realizar lo solicitado, por favor intentente en otro momento',
            'error'
          )
        })
      } else {
        Swal.fire(
          'Parcialidad enviada',
          'Se envió la parcialidad con éxito al Beneficio del Café',
          'success'
        )
        this.spinner.hide();

        $('#modalSecundary').modal('hide');
        $('#opcionesGenerales').modal('hide');
      }
    }, err => {
      this.spinner.hide();
      Swal.fire(
        'Error',
        'No fue posible realizar lo solicitado, por favor intentente en otro momento',
        'error'
      )
    })
  }

  regresar() {
    this.botonesModalSecundario = [];
    this.controlesModalSecundario = [];
    Object.keys(this.controlesSecundariosFormGroup.controls).forEach((key) => {
      this.controlesSecundariosFormGroup.removeControl(key);
    });

    this.controlesSecundariosFormGroup.updateValueAndValidity();
    $('#detalleEsperaAprobacion').modal('hide');
    $('#detalleCuentaCreada').modal('hide');
    $('#modalSecundary').modal('hide');
    $('#detalleCuentaAbierta').modal('hide');
    $('#detallePesajeIniciado').modal('hide');
    $('#detalleCuentaConfirmada').modal('hide');
    $('#detalleCuentaCerrada').modal('hide');
    $('#detallaSolicitudRechazada').modal('hide');
    $('#verCarnetTransportista').modal('hide');
    $('#opcionesGenerales').modal('show');
  }

  verTracking(solicitud: any) {
    console.log(solicitud.estado)
    switch (solicitud.estado) {
      case 'En espera de aprobacion':
        $('#opcionesGenerales').modal('hide');
        $('#detalleEsperaAprobacion').modal('show');
        break;

      case 'Cuenta creada':
        $('#opcionesGenerales').modal('hide');
        $('#detalleCuentaCreada').modal('show');
        break;

      case 'Cuenta abierta':
        $('#opcionesGenerales').modal('hide');
        $('#detalleCuentaAbierta').modal('show');
        break;

      case 'Pesaje iniciado':
        $('#opcionesGenerales').modal('hide');
        $('#detallePesajeIniciado').modal('show');
        break;

      case 'Cuenta cerrada':
        $('#opcionesGenerales').modal('hide');
        $('#detalleCuentaCerrada').modal('show');
        break;

      case 'Cuenta confirmada':
        $('#opcionesGenerales').modal('hide');
        $('#detalleCuentaConfirmada').modal('show');
        break;

      case 'Solicitud rechazada':
        $('#opcionesGenerales').modal('hide');
        $('#detallaSolicitudRechazada').modal('show');
      break;
    }
  }

  crearSolicitud() {
    this.spinner.show();
    const nuevaSolicitud = {
      "descripcion": this.controlesFormGroup.get('descripcion')?.value,
      "estadoSolicitiud": "58ec8186-e3fd-11ed-b5ea-0242ac120002",
      "placa": this.controlesFormGroup.get('placa')?.value,
      "cantidadParcialidades": this.controlesFormGroup.get('parcialidades')?.value,
      "piloto": this.controlesFormGroup.get('piloto')?.value,
      "usuarioCreacion": this.idUsuario,
      "fechaCreacion": new Date()
    }

    this.solicitudesService.crearsolicitud(nuevaSolicitud).subscribe(solicitud => {
      $('#opcionesGenerales').modal('hide');
      this.cleanForm();
      Swal.fire(
        'Solicitud creada con exito',
        'Se creó la solicitud exitosamente, puedes consultar el estado de la solicitud en el módulo "Solicitudes Realizadas"',
        'success'
      )
      this.spinner.hide();
    }, err => {
      if (err.status === 422) {
        Swal.fire(
          'Error',
          'La placa o el piloto proporcionados no existen, por favor validar',
          'info'
        )
      } else {
        Swal.fire(
          'Error',
          'No fue posible crear la solicitud, por favor intentente en otro momento',
          'error'
        )
      }
      this.spinner.hide();
    })
  }

  cerrarSesion() {
    this.spinner.show()
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      this.spinner.hide();
      this.router.navigate(['login'])
      this.loginService.role = '',
        this.loginService.id = ''
    }, 800);
  }

  cleanForm() {
    this.botonesModalSecundario = [];
    this.controlesModalSecundario = [];
    Object.keys(this.controlesFormGroup.controls).forEach((key) => {
      this.controlesFormGroup.removeControl(key);
    });

    Object.keys(this.controlesSecundariosFormGroup.controls).forEach((key) => {
      this.controlesSecundariosFormGroup.removeControl(key);
    });

    this.controlesSecundariosFormGroup.updateValueAndValidity();

    this.controlesFormGroup.updateValueAndValidity();
    this.controles = [];
    this.botonesFooter = [];
    this.showTable = false;
    this.dataSource.data = [];

    $("#opcionesGenerales").modal('hide');
  }

  /* Metodo para validar numeros 
  ingreso solo de numeros */
  public soloNumeros(e: any) {
    const key: any = e.keyCode || e.which;
    const teclado: any = String.fromCharCode(key);
    const especiales: any = '.';
    const numero: any = '0123456789';
    let teclado_especial: boolean = false;

    for (const i in especiales) {
      if (key === especiales[i]) {
        teclado_especial = true;
        return true;
      }
    }
    if (numero.indexOf(teclado) === -1 && !teclado_especial) {
      return false;
    }
    return true;
  }

}
