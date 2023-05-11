/// <reference types="node" />
import * as CryptoJS from 'crypto-js';

import { Injectable } from '@angular/core';
import { catchError, take, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OkexService {
  constructor(private http: HttpClient) {}

  sign(message: string, secretKey: string) {
    const signature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(message, secretKey),
    );
    return signature;
  }

  withdrawalOkex(
    requestPath: string,
    data: any,
    apiKey: string,
    passphrase: string,
    secretKey: string,
  ) {
    const timestamp = Date.now() / 1000;
    const body = JSON.stringify(data);
    const signature = this.createSign('POST', requestPath, body, timestamp, secretKey);

    const headers: HttpHeaders = new HttpHeaders({
      'OK-ACCESS-KEY': apiKey,
      'OK-ACCESS-SIGN': `${signature}`,
      'OK-ACCESS-TIMESTAMP': `${timestamp}`,
      'OK-ACCESS-PASSPHRASE': passphrase,
    });

    return this.http.post(`/api/v5/asset/withdrawal`, body, { headers }).pipe(
      take(1),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      }),
    );
  }

  createSign(
    method: any,
    requestPath: any,
    body: any,
    timestamp: any,
    secretKey: string,
  ) {
    const message = timestamp + method.toUpperCase() + requestPath + body;
    const result = this.sign(message, secretKey);
    return result;
  }
}
