import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CuentasService } from 'src/app/Services/CuentasService.service';
import { LoginService } from 'src/app/Services/LoginService.service';
import { SolicitudesService } from 'src/app/Services/SolicitudesService.service';
import Swal from 'sweetalert2';
declare let $: any;
import * as moment from 'moment';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-beneficio-main',
  templateUrl: './beneficio-main.component.html',
  styleUrls: ['./beneficio-main.component.css']
})
export class BeneficioMainComponent implements OnInit {
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
  botonesFooter: any = [];
  botonesSecundarios: any = [];
  botonesModalSecundario: any = [];
  showTable = false;
  solicitudValida = false;
  complementoSolicitudInvalida = '';
  complementoSolicitudValida = '';
  solicitud = ''
  faltanteSobrante = ''
  totalPesoSobranteFaltante: any;
  sinPesajes: boolean = true;
  totalPesajes: any;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;

  constructor(private spinner: NgxSpinnerService, private router: Router, private loginService: LoginService, private solicitudesService: SolicitudesService, private cuentasService: CuentasService) {
    this.controlesFormGroup = new FormGroup({});
    this.controlesSecundariosFormGroup = new FormGroup({});

    const opciones = [];
    opciones.push(
      {
        tituloSeccion: '', class: 'carousel-item active',
        opciones:
          [
            { nombre: 'Solicitudes ingresadas', descripcion: 'Solicitudes pendientes de aprobar', icono: 'check_box', accion: 'solicitudesPendientes' },
            { nombre: 'Confirmar solicitudes', descripcion: 'Solicitudes pendientes de confirmar', icono: 'done_all', accion: 'solicitudesConfirmar' },
            { nombre: 'Consulta pesajes', descripcion: 'Consulta de Pesos Ingresados por fechas', icono: 'reorder', accion: 'reportePesajeFechas' },
            { nombre: 'Reporte mejor cliente', descripcion: 'Reporte del mejor cliente', icono: 'supervised_user_circle', accion: 'reporteClientes' },
            { nombre: 'Reporte Anexos', descripcion: 'Reporte de agricultores con Sobrantes y Faltantes', icono: 'swap_vert', accion: 'reporteAnexos' },
            { nombre: 'Cerrar sesión', descripcion: 'Cerrar sesión', icono: 'power_settings_new', accion: 'cerrarSesion' },
          ]
      }
    )
    this.opcionesMenu = opciones;
  }

  ngOnInit(): void {
    this.spinner.show();
    if (localStorage.getItem('role') !== 'ROLE_UMG_BC_BENEFICIO') {
      this.spinner.hide();
      this.router.navigate(['login']);
    }
    this.spinner.hide();

  }

  openDialog(accion: any) {
    setTimeout(() => this.dataSource.paginator = this.paginator);
    switch (accion) {
      case 'solicitudesPendientes':
        this.tituloFormulario = 'Revisión de solicitudes ingresadas al Beneficio del Café'
        $('#opcionesGenerales').modal('show');
        break;

      case 'reporteAnexos':
        this.tituloFormulario = 'Reporte de clientes con Sobrantes y Faltantes'
        $('#opcionesGenerales').modal('show');
        break;

      case 'reportePesajeFechas':
        this.tituloFormulario = 'Reporte de Pesajes ingresados por Fechas'
        $('#opcionesGenerales').modal('show');
        break;

      case 'solicitudesConfirmar':
        this.tituloFormulario = 'Revisión de solicitudes pendientes de confirmar'
        $('#opcionesGenerales').modal('show');
        break;

      case 'reporteClientes':
        this.tituloFormulario = 'Reporte del mejor cliente'
        $('#opcionesGenerales').modal('show');
        break;

      case 'cerrarSesion':
        this.cerrarSesion();
        break;
    }
    this.generarControles(accion);
  }

  generarControles(accion: any) {
    this.spinner.show();
    let controles = []
    let botonesFooter = []
    switch (accion) {
      case 'reportePesajeFechas':
        controles.push(
          {
            tituloStep: 'Filtro de búsqueda',
            controles: [
              {
                id: 'fechas', nombrefila: '', formControl: new FormControl('', Validators.required), change: false, keypress: true,
                tipo: 'datepicker', nombre: 'Fechas a consultar', maxLength: 100, class: 'col-5', restclass: '', divider: true,

              },
            ],
          }
        )
        const fechas = {
          "fechaInicio": "",
          "fechaFin": ""
        }

        this.botonesSecundarios.push(
          { nombre: 'Buscar', class: 'botonesStepper', icono: 'search', click: () => this.buscarPesosByFechas() },
        )

        botonesFooter.push(
          { nombre: 'Cerrar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
        )
        this.spinner.hide();
        break;

      case 'reporteClientes':
        this.columnsToDisplay = [{ id: 'username', displayName: 'Nombre de Usuario del cliente' }, { id: 'totalPesaje', displayName: 'Total pesaje registrado' }, { id: 'totalSolicitudes', displayName: 'Total de solicitudes creadas' }]
        this.columnsChildrenIds = ['username', 'totalPesaje', 'totalSolicitudes']

        this.solicitudesService.getBestClients().subscribe(res => {
          this.showTable = true;
          this.dataSource.data = res.data;
          setTimeout(() => this.dataSource.paginator = this.paginator);
          this.spinner.hide()
        })

        botonesFooter.push(
          { nombre: 'Imprimir Excel', class: 'btn-container mt-2', click: () => this.generarReporteBestClient(), disable: false },
          { nombre: 'Cerrar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
        )
        break;

      case 'reporteAnexos':
        this.columnsToDisplay = [{ id: 'cuenta', displayName: 'No. Cuenta' }, { id: 'agricultor', displayName: 'Usuario cliente' }, { id: 'peso', displayName: 'Total Peso' }, { id: 'sobranteFaltante', displayName: 'Sobrante / Faltante' }, { id: 'observaciones', displayName: 'Observaciones anexo' }]
        this.columnsChildrenIds = ['cuenta', 'agricultor', 'peso', 'sobranteFaltante', 'observaciones']

        this.solicitudesService.getClientesWithSobrantesFaltantes().subscribe(res => {
          this.showTable = true;
          this.dataSource.data = res.data;
          setTimeout(() => this.dataSource.paginator = this.paginator);
          this.spinner.hide()
        })

        botonesFooter.push(
          { nombre: 'Imprimir Excel', class: 'btn-container mt-2', click: () => this.generarReporteAnexos(), disable: false },
          { nombre: 'Cerrar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
        )
        break;

      case 'solicitudesPendientes':
        this.showTable = true;
        this.columnsToDisplay = [{ id: 'totalPesaje', displayName: 'Total pesaje solicitado' }, { id: 'placa', displayName: 'Placa transporte' }, { id: 'piloto', displayName: 'Licencia piloto' },
        { id: 'accion', displayName: 'Acción', icono: 'remove_red_eye', titleAccion: 'Validar estado', accion: (element: any) => this.validarEstado(element) }]
        this.columnsChildrenIds = ['totalPesaje', 'placa', 'piloto', 'accion']

        controles.push(
          {
            tituloStep: 'Solicitudes pendientes de aprobar',
            controles: [
            ],
          }
        )
        const estado = {
          "estado": "58ec8186-e3fd-11ed-b5ea-0242ac120002"
        }
        this.solicitudesService.getSolicitudesByEstado(estado).subscribe(res => {
          this.showTable = true;
          this.dataSource.data = res;
          setTimeout(() => this.dataSource.paginator = this.paginator);
          this.spinner.hide()
        })

        botonesFooter.push(
          { nombre: 'Cerrar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
        )
        this.spinner.hide()
        break;

      case 'solicitudesConfirmar':
        this.showTable = true;
        this.columnsToDisplay = [{ id: 'totalPesaje', displayName: 'Total pesaje solicitado' }, { id: 'placa', displayName: 'Placa transporte' }, { id: 'piloto', displayName: 'Licencia piloto' },
        { id: 'accion', displayName: 'Acción', icono: 'remove_red_eye', titleAccion: 'Validar estado', accion: (element: any) => this.validarConfirmacionSolicitud(element) }]
        this.columnsChildrenIds = ['totalPesaje', 'placa', 'piloto', 'accion']

        controles.push(
          {
            tituloStep: 'Solicitudes pendientes de confirmar',
            controles: [
            ],
          }
        )
        const estadoCerrado = {
          "estado": "cb33b950-eac2-11ed-a05b-0242ac120003"
        }
        this.solicitudesService.getSolicitudesByEstado(estadoCerrado).subscribe(res => {
          this.showTable = true;
          this.dataSource.data = res;
          setTimeout(() => this.dataSource.paginator = this.paginator);
          this.spinner.hide()
        })

        botonesFooter.push(
          { nombre: 'Cerrar', class: 'btn-container mt-2', click: () => this.cleanForm(), disable: false },
        )
        this.spinner.hide()
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

  generarReporteBestClient() {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Reporte');
    var currentLine = 1;
    // Headers primera hoja del excel
    let headersReportes = [];

    worksheet.getRow(currentLine).getCell(1).value = 'Usuario del cliente';
    headersReportes.push('A' + currentLine);
    worksheet.getRow(currentLine).getCell(2).value = 'Total pesaje registrado';
    headersReportes.push('B' + currentLine);
    worksheet.getRow(currentLine).getCell(3).value = 'Total solicitudes creadas';
    headersReportes.push('C' + currentLine);

    currentLine++;
    console.log('el datasource es ', this.dataSource.data)

    this.dataSource.data.forEach((dataRow: any) => {
      console.log('el datarow es', dataRow)
      worksheet.getRow(currentLine).getCell(1).value = dataRow.username;
      worksheet.getRow(currentLine).getCell(2).value = dataRow.totalPesaje;
      worksheet.getRow(currentLine).getCell(3).value = dataRow.totalSolicitudes;
      currentLine++;
    });

    /*Width columns primera hoja dele excel*/
    worksheet.columns[0].width = 35;
    worksheet.columns[1].width = 35;
    worksheet.columns[2].width = 35;

    headersReportes.map((key) => {
      worksheet.getCell(key).font = {
        name: 'Arial',
        size: 14,
        family: 2,
        bold: true,
      };
    });

    headersReportes.map((key) => {
      worksheet.getCell(key).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '92D16B' },
        bgColor: { argb: '92D16B' },
      };
    });

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    //Descargar
    workbook.xlsx.writeBuffer().then((json) => {
      let blob = new Blob([json], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, "Reporte mejor cliente" + '.xlsx');
    });
  }

  generarReporteAnexos() {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Reporte');
    var currentLine = 1;
    // Headers primera hoja del excel
    let headersReportes = [];

    worksheet.getRow(currentLine).getCell(1).value = 'No. Cuenta';
    headersReportes.push('A' + currentLine);
    worksheet.getRow(currentLine).getCell(2).value = 'Usuario del cliente';
    headersReportes.push('B' + currentLine);
    worksheet.getRow(currentLine).getCell(3).value = 'Total peso';
    headersReportes.push('C' + currentLine);
    worksheet.getRow(currentLine).getCell(4).value = 'Sobrante/Faltante';
    headersReportes.push('D' + currentLine);
    worksheet.getRow(currentLine).getCell(5).value = 'Observaciones anexo';
    headersReportes.push('E' + currentLine);

    currentLine++;

    this.dataSource.data.forEach((dataRow: any) => {
      console.log('el datarow es', dataRow)
      worksheet.getRow(currentLine).getCell(1).value = dataRow.cuenta;
      worksheet.getRow(currentLine).getCell(2).value = dataRow.agricultor;
      worksheet.getRow(currentLine).getCell(3).value = dataRow.peso;
      worksheet.getRow(currentLine).getCell(4).value = dataRow.sobranteFaltante;
      worksheet.getRow(currentLine).getCell(5).value = dataRow.observaciones;
      worksheet.getRow(currentLine).getCell(5).alignment = { wrapText: true };
      currentLine++;
    });
    

    /*Width columns primera hoja dele excel*/
    worksheet.columns[0].width = 35;
    worksheet.columns[1].width = 35;
    worksheet.columns[2].width = 35;
    worksheet.columns[3].width = 35;
    worksheet.columns[4].width = 35;

    headersReportes.map((key) => {
      worksheet.getCell(key).font = {
        name: 'Arial',
        size: 14,
        family: 2,
        bold: true,
      };
    });

    headersReportes.map((key) => {
      worksheet.getCell(key).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '92D16B' },
        bgColor: { argb: '92D16B' },
      };
    });

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    //Descargar
    workbook.xlsx.writeBuffer().then((json) => {
      let blob = new Blob([json], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, "Reporte Anexos" + '.xlsx');
    });
  }

  buscarPesosByFechas() {
    this.spinner.show();
    let consultaFechas = {
      "fechaInicio": moment(this.range.get('start')?.value).format('DD-MM-YYYY'),
      "fechaFin": moment(this.range.get('end')?.value).format('DD-MM-YYYY')
    }
    this.solicitudesService.getPesajesbyFechas(consultaFechas).subscribe(res => {
      this.spinner.hide();
      $('#opcionesGenerales').modal('hide');
      $('#verPesajes').modal('show');
      if (res.data > 0) {
        this.sinPesajes = false;
        this.totalPesajes = res.data;
      } else {
        this.sinPesajes = true;

      }
    })
  }

  validarConfirmacionSolicitud(accion: any) {
    this.spinner.show();
    this.tituloModalSecundario = 'Validar faltantes y sobrantes de la solicitud'
    let botones: any = [];
    this.solicitud = accion.idSolicitud
    let validarSolicitud = {
      "solicitud": accion.idSolicitud
    }

    this.solicitudesService.validarFaltantesSobrantes(validarSolicitud).subscribe(res => {
      if (res.data.valido) { //Faltantes y sobrantes validos
        this.solicitudValida = true;
        this.complementoSolicitudValida = `El sistema determinó que el agricultor envió un total de ${parseFloat(res.data.pesoIngresado).toFixed(2)}Tn y la empresa Peso Cabal registró un total de ${parseFloat(res.data.pesoBascula).toFixed(2)}Tn, por lo que se determina que el Faltante o Sobrante corresponde al +-5% (Faltante valido: ${parseFloat(res.data.minimo).toFixed(2)}Tn, Sobrante valido: ${parseFloat(res.data.maximo).toFixed(2)}Tn)`
        botones.push(
          { nombre: 'Confirmar cuenta', icono: 'check_circle', class: 'btn-container mt-2 ml-2', click: () => this.guardarConfirmacionCuenta(accion) },
        )

      } else if (!res.data.valido) { //Faltantes y sobrantes invalidos
        this.solicitudValida = false;
        this.controlesModalSecundario.push(
          {
            id: 'observaciones', nombrefila: 'Anexo por faltante o sobrante', formControl: new FormControl({ value: '', disabled: false }, Validators.required),
            tipo: 'textarea', nombre: 'Observaciones', class: 'col-8', restclass: '0', maxlength: 300
            //controlesComplemento: [{ id: 'descripcionUbicacion', formControl: new FormControl({ value: '', disabled: true }), tipo: 'input', nombre: 'Descripción Ubicación', class: 'col-12' }]
          },
        )
        // Mensaje complementario dependiendo de los sobrantes o faltantes
        if (res.data.faltanteSobrante === "S") {
          this.faltanteSobrante = "S"
          let sobrante: number = res.data.pesoBascula - res.data.pesoIngresado;
          this.complementoSolicitudInvalida = `Este anexo es para indicarle que el sistema detecto un Sobrante de ${sobrante.toFixed(2)}Tn, el total ingresado por el agricultor es: ${parseFloat(res.data.pesoIngresado).toFixed(2)}Tn y el total ingresado por Peso Cabal es: ${parseFloat(res.data.pesoBascula).toFixed(2)}Tn, debe indicarle al Beneficio del Café lo que quiere hacer con el sobrante.`;
          this.totalPesoSobranteFaltante = sobrante.toFixed(2);
        } else if (res.data.faltanteSobrante === "F") {
          this.faltanteSobrante = "F"
          let faltante: number = res.data.pesoIngresado - res.data.pesoBascula;
          this.complementoSolicitudInvalida = `Este anexo es para indicarle que el sistema detecto un Faltante de ${faltante.toFixed(2)}Tn, el total ingresado por el agricultor es: ${parseFloat(res.data.pesoIngresado).toFixed(2)}Tn y el total ingresado por Peso Cabal es: ${parseFloat(res.data.pesoBascula).toFixed(2)}Tn, debe indicarle al Beneficio del Café lo que quiere hacer con el faltante.`;
          this.totalPesoSobranteFaltante = faltante.toFixed(2);
        }

        botones.push(
          { nombre: 'Confirmar cuenta', icono: 'check_circle', class: 'btn-container mt-2 ml-2', click: () => this.crearAnexo(accion), disabled: true },
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

        this.controlesSecundariosFormGroup.get('observaciones')?.setValue(this.complementoSolicitudInvalida)
      }
      this.spinner.hide()
    })

    botones.push(
      { nombre: 'Regresar', icono: 'arrow_back', class: 'btn-container mt-2 ml-2', click: () => this.regresar() },
    )

    this.botonesModalSecundario = botones;
    $('#opcionesGenerales').modal('hide');
    $('#modalSecundary').modal('show');

  }



  validarEstado(accion: any) {
    this.spinner.show();
    this.tituloModalSecundario = 'Validar solicitud'
    let botones: any = [];
    this.solicitud = accion.idSolicitud
    let validarSolicitud = {
      "solicitud": accion.idSolicitud
    }

    this.solicitudesService.validarSolicitud(validarSolicitud).subscribe(res => {
      if (res.code === 200) { //solicitud valida
        this.solicitudValida = true;
        this.complementoSolicitudValida = "Esta solicitud es válida porque el piloto y transporte son permitidos dentro del Beneficio del Café."
        botones.push(
          { nombre: 'Confirmar cuenta', icono: 'check_circle', class: 'btn-container mt-2 ml-2', click: () => this.confirmarCuenta() },
        )
      } else if (res.code === 412) { //solicitud invalida
        this.solicitudValida = false;
        this.controlesModalSecundario.push(
          {
            id: 'rechazo', nombrefila: 'Motivo rechazo', formControl: new FormControl({ value: '', disabled: false }, Validators.required),
            tipo: 'textarea', nombre: 'Motivo del rechazo', class: 'col-8', restclass: '0', maxlength: 300
            //controlesComplemento: [{ id: 'descripcionUbicacion', formControl: new FormControl({ value: '', disabled: true }), tipo: 'input', nombre: 'Descripción Ubicación', class: 'col-12' }]
          },
        )
        botones.push(
          { nombre: 'Rechazar solicitud', icono: 'clear', class: 'btn-container mt-2 ml-2', click: () => this.rechazarSolicitud(), disabled: true },
        )
        // Mensaje complementario dependiendo de lo que no es aceptado
        if (!res.data.pilotoEstatus && !res.data.transporteEstatus) {
          this.complementoSolicitudInvalida = "Esta solicitud es inválida porque el piloto y el transporte no son aceptados en el Beneficio del Cafe";
        } else if (!res.data.pilotoEstatus) {
          this.complementoSolicitudInvalida = "Esta solicitud es inválida porque el piloto no es aceptado en el Beneficio del Cafe";
        } else if (!res.data.transporteEstatus) {
          this.complementoSolicitudInvalida = "Esta solicitud es inválida porque el transporte no es aceptado en el Beneficio del Cafe";
        }
        this.controlesModalSecundario.forEach((element: any) => {
          if (element.controlesComplemento) {
            element.controlesComplemento.forEach((e: any) => {
              this.controlesSecundariosFormGroup.addControl(e.id, e.formControl);
            })
          }
          this.controlesSecundariosFormGroup.addControl(element.id, element.formControl);
        });
        this.controlesSecundariosFormGroup.updateValueAndValidity();

        this.controlesSecundariosFormGroup.get('rechazo')?.setValue(this.complementoSolicitudInvalida + ", por lo tanto se rechaza")
      }
      this.spinner.hide()
    })

    botones.push(
      { nombre: 'Regresar', icono: 'arrow_back', class: 'btn-container mt-2 ml-2', click: () => this.regresar() },
    )

    this.botonesModalSecundario = botones;
    $('#opcionesGenerales').modal('hide');
    $('#modalSecundary').modal('show');
  }

  rechazarSolicitud() {
    this.spinner.show();
    let actualizacion = {
      "solicitud": this.solicitud,
      "nuevoEstado": "d9bd0038-eb05-11ed-a05b-0242ac120003",
      "usuarioModificacion": localStorage.getItem('idUser'),
      "fechaModificacion": new Date()
    }
    this.solicitudesService.actualizarSolicitud(actualizacion).subscribe(respuesta => {
      Swal.fire({
        'title': 'Solicitud rechazada',
        'html': `Se rechazó la solicitud por no cumplir con los requisitos del Beneficio del Café.`,
        'icon': 'success'
      })
    }, err => {
      Swal.fire({
        'title': 'Error',
        'html': `En este momento no fue posible realizar la accion, por favor intente en otro momento.`,
        'icon': 'error'
      })
      this.spinner.hide()
    })

    let rechazo = {
      "solicitud": this.solicitud,
      "observaciones": this.controlesSecundariosFormGroup.get('rechazo')?.value,
      "usuarioCreacion": localStorage.getItem('idUser'),
      "fechaCreacion": new Date()
    }
    this.solicitudesService.crearRechazo(rechazo).subscribe(res => {
      this.spinner.hide()
    }, err => {
      Swal.fire({
        'title': 'Error',
        'html': `En este momento no fue posible realizar la accion, por favor intente en otro momento.`,
        'icon': 'error'
      })
      this.spinner.hide()
    })

    $('#opcionesGenerales').modal('hide');
    $('#modalSecundary').modal('hide');
    this.cleanForm();
  }

  confirmarCuenta() {
    this.spinner.show()
    const banco = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let noCuenta = "";
    for (let i = 0; i <= 14; i++) {
      noCuenta += banco.charAt(Math.floor(Math.random() * banco.length));
    }

    let nuevaCuenta = {
      "noCuenta": noCuenta,
      "estado": "15757fb6-468b-44e1-a829-fa47bb2705e6",
      "solicitud": this.solicitud,
      "usuarioCreacion": localStorage.getItem('idUser'),
    }
    this.cuentasService.crearCuenta(nuevaCuenta).subscribe(res => {

      let actualizacion = {
        "solicitud": this.solicitud,
        "nuevoEstado": "15757fb6-468b-44e1-a829-fa47bb2705e6",
        "usuarioModificacion": localStorage.getItem('idUser'),
        "fechaModificacion": new Date()
      }

      this.solicitudesService.actualizarSolicitud(actualizacion).subscribe(respuesta => {
        Swal.fire({
          'title': 'Confirmación de solicitud',
          'html': `Se confirmó que la solicitud es válida. Se creó la cuenta: <b>${noCuenta}</b>  para trabajar este pedido.`,
          'icon': 'success'
        })
      }, err => {
        Swal.fire({
          'title': 'Error',
          'html': `En este momento no fue posible realizar la accion, por favor intente en otro momento.`,
          'icon': 'error'
        })
        this.spinner.hide()
      })
      this.spinner.hide()
    }, err => {
      Swal.fire({
        'title': 'Error',
        'html': `En este momento no fue posible realizar la accion, por favor intente en otro momento.`,
        'icon': 'error'
      })
      this.spinner.hide()
    })
    $('#modalSecundary').modal('hide');
    this.cleanForm();
  }


  crearAnexo(data: any) {
    this.spinner.show()
    this.guardarConfirmacionCuenta(data);
    let anexo = {
      "solicitud": this.solicitud,
      "observaciones": this.controlesSecundariosFormGroup.get('observaciones')?.value,
      "sobranteFaltante": this.faltanteSobrante,
      "usuarioCreacion": localStorage.getItem('idUser'),
      "peso": Number(this.totalPesoSobranteFaltante)
    }

    this.solicitudesService.crearAnexo(anexo).subscribe(res => {
      this.spinner.hide()
    }, err => {
      Swal.fire({
        'title': 'Error',
        'html': `En este momento no fue posible realizar la accion, por favor intente en otro momento.`,
        'icon': 'error'
      })
      this.spinner.hide()
    })
  }

  guardarConfirmacionCuenta(solicitud: any) {
    this.spinner.show();
    let actualizacion = {
      "solicitud": this.solicitud,
      "nuevoEstado": "c5e2a590-eb00-11ed-a05b-0242ac120003",
      "usuarioModificacion": localStorage.getItem('idUser'),
      "fechaModificacion": new Date()
    }

    this.solicitudesService.actualizarSolicitud(actualizacion).subscribe(respuesta => {
      Swal.fire({
        'title': 'Confirmación de cuenta',
        'html': `Se confirmó la cuenta, gracias por usar el sistema de automatización del proceso del Beneficio del Café.`,
        'icon': 'success'
      })
      $('#opcionesGenerales').modal('hide');
      $('#modalSecundary').modal('hide');
      this.cleanForm();
    }, err => {
      Swal.fire({
        'title': 'Error',
        'html': `En este momento no fue posible realizar la accion, por favor intente en otro momento.`,
        'icon': 'error'
      })
      this.spinner.hide()
    });

    // Cambiar estado de cuenta a Cuenta Abierta
    let nuevoEstadoCuenta = {
      "idCuenta": solicitud.idCuenta,
      "nuevoEstado": "c5e2a590-eb00-11ed-a05b-0242ac120003",
      "usuarioModificacion": localStorage.getItem('idUser')
    }
    this.cuentasService.actualizarCuenta(nuevoEstadoCuenta).subscribe(res => {
      this.spinner.hide()
      $('#opcionesGenerales').modal('hide');
      $('#modalSecundary').modal('hide');
      this.cleanForm();
    }, err => {
      this.spinner.hide()
      Swal.fire(
        'Error',
        'No fue posible realizar lo solicitado, por favor intentente en otro momento',
        'error'
      )
    })

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
      this.loginService.role = ''
      //window.location.reload();
    }, 800);
  }

  /* Metodo para validar numeros 
  ingreso solo de numeros */
  public soloNumeros(e: any) {
    const key: any = e.keyCode || e.which;
    const teclado: any = String.fromCharCode(key);
    const especiales: any = '.';
    const numero: any = '01234567898';
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

  regresar() {
    //this.showTableSeconModal = false;
    this.botonesModalSecundario = [];
    this.controlesModalSecundario = [];
    Object.keys(this.controlesSecundariosFormGroup.controls).forEach((key) => {
      this.controlesSecundariosFormGroup.removeControl(key);
    });

    this.controlesSecundariosFormGroup.updateValueAndValidity();
    $('#opcionesGenerales').modal('show');
    $('#modalSecundary').modal('hide');
    $('#verPesajes').modal('hide');
  }

}
