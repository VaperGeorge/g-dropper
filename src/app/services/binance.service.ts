/// <reference types="node" />
import * as CryptoJS from 'crypto-js';

import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CoinData } from '../interfaces/coin';

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  constructor(private http: HttpClient) {}

  withdrawalBinance(payload: any, apiKey: string, secretKey: string) {
    const queryString = Object.keys(payload)
      .map((key) => `${key}=${payload[key]}`)
      .join('&');

    const signature = CryptoJS.HmacSHA256(queryString, secretKey).toString(
      CryptoJS.enc.Hex,
    );

    const headers = new HttpHeaders({
      'X-MBX-APIKEY': apiKey,
    });

    const body = { ...payload, signature };
    const params = new HttpParams({ fromObject: body });

    return this.http
      .post(`/sapi/v1/capital/withdraw/apply`, {}, { headers, params })
      .pipe(take(1));
  }

  getAllCoinsData(apiKey: string, secretKey: string) {
    const timestamp = Date.now();
    const signature = CryptoJS.HmacSHA256('timestamp=' + timestamp, secretKey).toString(
      CryptoJS.enc.Hex,
    );

    const headers = new HttpHeaders({
      'X-MBX-APIKEY': apiKey,
    });

    const params = {
      timestamp: timestamp,
      signature: signature,
    };

    return this.http.get<CoinData[]>('/sapi/v1/capital/config/getall', {
      headers: headers,
      params: params,
    });
  }

  // test(apiKey: string, secretKey: string) {
  //   const timestamp = Date.now();
  //   const signature = CryptoJS.HmacSHA256('timestamp=' + timestamp, secretKey).toString(
  //     CryptoJS.enc.Hex,
  //   );

  //   const headers = new HttpHeaders({
  //     'X-MBX-APIKEY': apiKey,
  //   });

  //   const body = {
  //     timestamp: timestamp,
  //     signature: signature,
  //   };

  //   const params = new HttpParams({ fromObject: body });

  //   return this.http.post<CoinData[]>(
  //     '/sapi/v3/asset/getUserAsset',
  //     {},
  //     { headers, params },
  //   );
  // }
}
