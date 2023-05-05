import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CuentasService } from 'src/app/Services/CuentasService.service';
import { LoginService } from 'src/app/Services/LoginService.service';
import { PesoCabalService } from 'src/app/Services/PesoCabalService.service';
import { SolicitudesService } from 'src/app/Services/SolicitudesService.service';
import Swal from 'sweetalert2';
declare let $: any;
//import * as QRCode from 'qrcode';

@Component({
  selector: 'app-peso-cabal-main',
  templateUrl: './peso-cabal-main.component.html',
  styleUrls: ['./peso-cabal-main.component.css']
})
export class PesoCabalMainComponent implements OnInit {
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
 


  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;

  constructor(private spinner: NgxSpinnerService, private router: Router, private loginService: LoginService, private solicitudesService: SolicitudesService, private pesoCabalService: PesoCabalService, private cuentasService: CuentasService) {
    this.controlesFormGroup = new FormGroup({});
    this.controlesSecundariosFormGroup = new FormGroup({});

    const opciones = [];
    opciones.push(
      {
        tituloSeccion: '', class: 'carousel-item active',
        opciones:
          [
            { nombre: 'Camiones por pesar', descripcion: 'Camiones en espera de ser pesados', icono: 'play_for_work', accion: 'solicitudesPendientes' },
           // { nombre: 'Imprimir QR', descripcion: 'Generar QR', icono: 'play_for_work', accion: 'generarQr' },
            { nombre: 'Cerrar sesión', descripcion: 'Cerrar sesión', icono: 'power_settings_new', accion: 'cerrarSesion' },
          ]
      }
    )
    this.opcionesMenu = opciones;
  }
  

  ngOnInit(): void {
    this.spinner.show();
    if (localStorage.getItem('role') !== 'ROLE_UMG_BC_PESO_CABAL') {
      this.spinner.hide();
      this.router.navigate(['login']);
    }
    this.spinner.hide();
  }

  openDialog(accion: any) {

    switch (accion) {
      case 'solicitudesPendientes':
        this.tituloFormulario = 'Revisión de solicitudes ingresadas al Beneficio del Café'
        $('#opcionesGenerales').modal('show');
        break;

      case 'cerrarSesion':
        this.cerrarSesion();
        break;

      case 'generarQr':
      this.generarQr();
      break;
    }
    this.generarControles(accion);
  }

  async generarQr() {
    /*
    let qrText = 'Elio';
      const canvas = this.qrCanvas.nativeElement;
      try {
        await QRCode.toCanvas(canvas, qrText);
      } catch (error) {
        console.error(error);
      }
    */
  }

  generarControles(accion: any) {
    this.spinner.show();
    let controles = []
    let botonesFooter = []
    switch (accion) {
      case 'solicitudesPendientes':
        this.showTable = true;
        this.columnsToDisplay = [{ id: 'piloto', displayName: 'Piloto enviado' }, { id: 'placa', displayName: 'Placa transporte' }, { id: 'pesoEnviado', displayName: 'Peso enviado' },
        {
          id: 'accion', displayName: 'Acción', icono: 'remove_red_eye', titleAccion: 'Ver tracking', accion: (element: any) => this.ingresarPeso(element),

        }]
        this.columnsChildrenIds = ['piloto', 'placa', 'pesoEnviado', 'accion']
        controles.push(
          {
            tituloStep: 'Informacion solicitudes parcialidades para ser pesadas',
            controles: [
            ],
          }
        )
        botonesFooter.push(
          { nombre: 'Cerrar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
        )

        let solicitudesByEstado = {
          "estado": false
        }
        this.solicitudesService.obtenerParcialidadesRevisionPesoCabal(solicitudesByEstado).subscribe(res => {
          console.log(res)
          this.dataSource.data = res;
          this.spinner.hide()
        }, err => {
          this.spinner.hide()
        })
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

  ingresarPeso(peso: any) {
    this.spinner.show()
    this.tituloModalSecundario = 'Ingreso del pesaje en bascula'
    let botones: any = [];

    this.controlesModalSecundario.push(
      {
        id: 'peso', nombrefila: 'Peso recibido', formControl: new FormControl({ value: '', disabled: false }, Validators.required),
        tipo: 'input', nombre: 'Peso de la parcialidad recibida (medida en toneladas)', class: 'col-8', restclass: '', maxLength: 3, keypress: true,
        //controlesComplemento: [{ id: 'noParcialidad', formControl: new FormControl({ value: '', disabled: true }), tipo: 'input', nombre: 'Número de parcialidad', class: 'col-12' }]
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
    botones.push(
      { nombre: 'Regresar', icono: 'arrow_back', class: 'btn-container mt-2 ml-2', click: () => this.regresar() },
      { nombre: 'Registrar peso', icono: 'play_for_work', class: 'btn-container mt-2 ml-2', click: () => this.guardarIngresoPeso(peso), disabled: true }

    )

    this.botonesModalSecundario = botones;
    $('#opcionesGenerales').modal('hide');
    $('#modalSecundary').modal('show');
    this.spinner.hide()
  }

  guardarIngresoPeso(peso: any) {
    this.spinner.show();
    let nuevoPeso = {
      "parcialidad": peso.idParcialidad,
      "peso": Number(this.controlesSecundariosFormGroup.get('peso')?.value),
      "usuarioCreacion": localStorage.getItem('idUser')
    }
    this.pesoCabalService.ingresarPeso(nuevoPeso).subscribe(res => {
      let actualizar = {
        "idParcialidad": peso.idParcialidad,
        "nuevoEstado": true,
        "usuarioModificacion": localStorage.getItem('idUser')
      }
      this.pesoCabalService.actualizarParcialidadIngresada(actualizar).subscribe(res => {
        let sol = {
          "solicitud": peso.solicitud
        }
        //Validar si es primera parcialidad
        this.solicitudesService.consultarDisponibilidadParcialidades(sol).subscribe(res => {
          if (res.message === "1") {
            // Es primera parcialidad
            let estado = {
              "solicitud": peso.solicitud,
              "nuevoEstado": "1ef988e7-4435-4a20-bb78-8b674eb3e589",
              "usuarioModificacion": localStorage.getItem('idUser'),
              "fechaModificacion": new Date()
            }
            this.solicitudesService.actualizarSolicitud(estado).subscribe(res => {
              Swal.fire(
                'Peso ingresado correctamente',
                'Se ingreso el peso correctamente, tambien se asigno el estado "Pesaje iniciado" a la solicitud',
                'success'
              )
              $('#modalSecundary').modal('hide');
              $('#opcionesGenerales').modal('hide');
              this.cleanForm();
              this.spinner.hide();
            }, err => {
              Swal.fire(
                'Error',
                'No fue posible realizar lo solicitado, por favor intentente en otro momento',
                'error'
              )
              this.spinner.hide();
            })
          } else {
            // Validar si es ultima parcialidad
            let consultaParcialidades = {
              "solicitud": peso.solicitud
            }
            this.solicitudesService.consultarDisponibilidadParcialidades(consultaParcialidades).subscribe(res => {
              if (!res.data) { //Quiere decir que es la ultima parcialidad disponible
                // Cambiar estado solicitud
                let estadoCerrada = {
                  "solicitud": peso.solicitud,
                  "nuevoEstado": "cb33b950-eac2-11ed-a05b-0242ac120003",
                  "usuarioModificacion": localStorage.getItem('idUser'),
                  "fechaModificacion": new Date()
                }
                this.solicitudesService.actualizarSolicitud(estadoCerrada).subscribe(res => {
                  Swal.fire(
                    'Peso ingresado correctamente',
                    'Se ingreso el peso correctamente',
                    'success'
                  )
                  $('#modalSecundary').modal('hide');
                  $('#opcionesGenerales').modal('hide');
                  this.cleanForm();
                  this.spinner.hide();
                }, err => {
                  Swal.fire(
                    'Error',
                    'No fue posible realizar lo solicitado, por favor intentente en otro momento',
                    'error'
                  )
                  this.spinner.hide();
                })

                // Cambiar estado cuenta cerrado
                let cuentaCerrada = {
                  "idCuenta": res.message,
                  "nuevoEstado": "cb33b950-eac2-11ed-a05b-0242ac120003",
                  "usuarioModificacion": localStorage.getItem('idUser')
                }
                this.cuentasService.actualizarCuenta(cuentaCerrada).subscribe(res => {
                  Swal.fire(
                    'Peso ingresado correctamente',
                    'Se ingreso el peso correctamente',
                    'success'
                  )

                  this.spinner.hide();
                  $('#modalSecundary').modal('hide');
                  $('#opcionesGenerales').modal('hide');
                  this.cleanForm();
                })

              } else {
                Swal.fire(
                  'Peso ingresado correctamente',
                  'Se ingreso el peso correctamente',
                  'success'
                )
                $('#modalSecundary').modal('hide');
                $('#opcionesGenerales').modal('hide');
                this.cleanForm();
                this.spinner.hide()
              }
            })
          }
        })
      }, err => {
        Swal.fire(
          'Error',
          'No fue posible realizar lo solicitado, por favor intentente en otro momento',
          'error'
        )
        this.spinner.hide();
      })

    }, err => {
      Swal.fire(
        'Error',
        'No fue posible realizar lo solicitado, por favor intentente en otro momento',
        'error'
      )
      this.spinner.hide();
    })
  }

  regresar() {
    this.botonesModalSecundario = [];
    this.controlesModalSecundario = [];
    Object.keys(this.controlesSecundariosFormGroup.controls).forEach((key) => {
      this.controlesSecundariosFormGroup.removeControl(key);
    });

    this.controlesSecundariosFormGroup.updateValueAndValidity();
    $('#modalSecundary').modal('hide');
    $('#opcionesGenerales').modal('show');
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

  public soloNumerosConDecimales(event: any ) {
    const key: any = event.keyCode || event.which;
    const caracter = String.fromCharCode(key);

    if (caracter.match('[0-9]') || (caracter === '.' && !this.botonesModalSecundario.get('peso')?.value.includes('.'))) {
      //const parts = (value ?? '').split('.');
      const parts = this.botonesModalSecundario.get('peso')?.value.split('.');
      if (parts.length > 1)
        return parts.pop().length < 2;
      return true;
    }

    return false;
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
