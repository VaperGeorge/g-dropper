import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';

const API_KEY = '8804dcc9-cb2e-480d-8b13-e32246a06a1a';
const PASSPHRASE = 'hLqu3XACMKY2YYz';

@Injectable()
export class OkxInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers;
    // console.log(req);
    // if (req.url) {
    //   headers = new HttpHeaders({
    //     'OK-ACCESS-KEY': API_KEY,
    //     'OK-ACCESS-PASSPHRASE': PASSPHRASE,
    //     'Content-Type': 'application/json',
    //   });
    // }
    const modifiedReq = req.clone({ headers });

    return next.handle(modifiedReq);
  }
}
