import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(private router: Router) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      console.log(localStorage.getItem('accessToken'), "elssjfe;lfjlej;")
      if (!token) {
        this.router.navigate(['login'])
        return false;
      } else {
        return true;
      }
      setTimeout(() => {
       
      }, 200);
    }
}
