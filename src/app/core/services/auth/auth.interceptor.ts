import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,from } from 'rxjs'; 
import { AuthenticationService } from './auth.service';
import { take,} from 'rxjs/operators';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

    constructor(private auth:AuthenticationService){
        
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.handle(req,next));
    }

    private async handle(req:HttpRequest<any>,next:HttpHandler) {
        const token = await this.auth.accessToken$.pipe(
            take(1)
        ).toPromise();
        
        req = req.clone({setHeaders:{
            Authorization:`Bearer ${token}`
        }});

        return next.handle(req).toPromise();
    }

}



