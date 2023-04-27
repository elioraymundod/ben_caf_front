import { Component, Input, OnInit } from '@angular/core';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.scss']
})
export class LoginComponentComponent implements OnInit {
  username: string;
  password: string;

  constructor(private authService: AuthServiceService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const usuario = {
      "username": this.username,
      "password": this.password
    }
    this.authService.login(usuario)
      .subscribe((token) => {
        console.log('el token es', token)
        localStorage.setItem('token', token);
      });
  }

}
