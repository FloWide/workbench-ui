
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AuthTokenInterceptor } from './services/auth/auth-token.interceptor';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers:[
    {
      provide:HTTP_INTERCEPTORS,
      useClass:AuthTokenInterceptor,
      multi:true
    }
  ]
})
export class CoreModule { }