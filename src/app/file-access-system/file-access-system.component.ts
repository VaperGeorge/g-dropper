import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, combineLatest, map, mergeMap, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CoinData, Network } from '../interfaces/coin';
import { BinanceService } from '../services/binance.service';
import { OkexService } from '../services/okex.service';
import { Withdrawal } from '../interfaces/withdrawal';

@Component({
  selector: 'app-file-access-system',
  templateUrl: './file-access-system.component.html',
  styleUrls: ['./file-access-system.component.scss'],
})
export class FileAccessSystemComponent implements OnInit {
  addresses: string[] = [];

  selectedFile!: File;

  public formOkex = this.fb.group({
    apiKey: this.fb.control('', [Validators.required]),
    secretKey: this.fb.control('', Validators.required),
    passphrase: this.fb.control('', Validators.required),
    amount_min: this.fb.control('', Validators.required),
    amount_max: this.fb.control('', Validators.required),
    currency: this.fb.control('', Validators.required),
    to_network: this.fb.control('', Validators.required),
  });

  public formBinance = this.fb.group({
    apiKey: this.fb.control('', [Validators.required]),
    secretKey: this.fb.control('', Validators.required),
    amount_min: this.fb.control('', Validators.required),
    amount_max: this.fb.control('', Validators.required),
    currency: this.fb.control('', Validators.required),
    to_network: this.fb.control(''),
  });

  selectedIndex$ = new BehaviorSubject<number>(0);
  allCoinsList$ = new BehaviorSubject<CoinData[]>([]);
  selectedCoinNetworks$ = new BehaviorSubject<Network[] | undefined>([]);

  constructor(
    private toastr: ToastrService,
    private okexService: OkexService,
    private binanceService: BinanceService,
    private fb: FormBuilder,
  ) {
    combineLatest([this.selectedIndex$, this.formBinance.valueChanges])
      .pipe(
        mergeMap(([index, form]) =>
          index === 1 && form.apiKey?.length && form.secretKey?.length
            ? this.allCoinsList$.value?.length
              ? this.allCoinsList$
              : this.binanceService.getAllCoinsData(
                  this.formBinance.value.apiKey,
                  this.formBinance.value.secretKey,
                )
            : of([]),
        ),
      )
      .subscribe((value) => {
        if (!this.allCoinsList$.value?.length) {
          this.allCoinsList$.next(value);
        }
      });

    combineLatest([
      this.allCoinsList$,
      this.formBinance.controls['currency'].valueChanges,
    ])
      .pipe(
        map(([coins, value]) => coins.find((coin) => coin.coin === value)?.networkList),
      )
      .subscribe((value) => {
        this.selectedCoinNetworks$.next(value);
      });
  }

  ngOnInit(): void {
    const formValueOkex = localStorage.getItem('cryptoFormValueOkex');
    const formValueBinance = localStorage.getItem('cryptoFormValueBinance');

    if (formValueOkex) {
      this.formOkex.patchValue(JSON.parse(formValueOkex));
    }
    if (formValueBinance) {
      this.formBinance.patchValue(JSON.parse(formValueBinance));
    }
  }

  async getFile() {
    let fileHandle: FileSystemFileHandle;
    [fileHandle] = await (window as any).showOpenFilePicker();

    if (fileHandle.kind === 'file') {
      this.selectedFile = await fileHandle.getFile();

      const reader = new FileReader();
      reader.onload = () => {
        this.addresses = (reader.result as string)
          ?.split('\n')
          .map((address: any) => address.trim());

        console.log(this.addresses);
      };
      reader.readAsText(this.selectedFile);
    }
  }

  createWithdrawal(address: any) {
    let withdrawal;
    if (this.selectedIndex$.value === 0) {
      const { currency, amount_min, amount_max, to_network } = this.formOkex.value;

      withdrawal = {
        ccy: currency,
        amt: this.getRandomNumber(amount_min, amount_max).toFixed(4),
        dest: 4,
        toAddr: address,
        fee: 0.0001,
        chain: to_network,
      };
    } else {
      const { currency, amount_min, amount_max, to_network } = this.formBinance.value;
      const timestamp = Date.now();

      withdrawal = {
        coin: currency,
        amount: this.getRandomNumber(amount_min, amount_max).toFixed(4),
        address: address,
        network: to_network,
        timestamp: `${timestamp}`,
      };
    }

    return withdrawal;
  }

  async sendRequests() {
    for (let i = 0; i < this.addresses.length; i++) {
      const address = this.addresses[i];
      const withdrawal = this.createWithdrawal(address);
      const requestPath = '/api/v5/asset/withdrawal';

      this.selectedIndex$.value === 0
        ? await this.sendRequestOkex(requestPath, withdrawal, address)
        : await this.sendRequestBinance(withdrawal, address);

      if (i < this.addresses.length - 1) {
        console.log(
          `Waiting 5 seconds before sending next request to ${this.addresses[i + 1]}`,
        );

        const time = this.getRandomNumber(1000, 10000);
        await this.sleep(Number.parseInt(time.toFixed()));
      }
    }
  }

  sendRequestOkex(requestPath: string, data: any, address: string) {
    const { apiKey, secretKey, passphrase, currency } = this.formOkex.value;

    this.okexService
      .withdrawalOkex(requestPath, data, apiKey, passphrase, secretKey)
      .subscribe((response: Withdrawal | any) => {
        if (response.code === '0') {
          this.toastr.success(
            `Successfully withdrew ${data.amount} ${currency} to ${address}`,
          );
        } else {
          this.toastr.error(
            `Failed to withdraw ${data.amount} ${currency} to ${address}: ${response.msg}`,
          );
        }
      });
  }

  sendRequestBinance(data: any, address: string) {
    const { apiKey, secretKey } = this.formBinance.value;

    this.binanceService.withdrawalBinance(data, apiKey, secretKey).subscribe({
      next: (response: { id?: string }) => {
        this.toastr.success(response.id, 'Whhooohooooo!');
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.toastr.error(error.error?.msg, error.error?.code);
      },
    });
  }

  submit() {
    if (this.selectedIndex$.value === 0) {
      console.log(this.formOkex.value);
      if (!this.formOkex.valid) {
        this.formOkex.markAllAsTouched();
        this.toastr.error('You should fill all the fields');
        return;
      }

      if (!this.selectedFile) {
        this.toastr.error('You should select the file with your accounts');
        return;
      }

      localStorage.setItem(
        'cryptoFormValueOkex',
        JSON.stringify(this.formOkex.getRawValue()),
      );
    }

    if (this.selectedIndex$.value === 1) {
      console.log(this.formBinance.value);
      if (!this.formBinance.valid) {
        this.formBinance.markAllAsTouched();
        this.toastr.error('You should fill all the fields');
        return;
      }

      if (!this.selectedFile) {
        this.toastr.error('You should select the file with your accounts');
        return;
      }
      localStorage.setItem(
        'cryptoFormValueBinance',
        JSON.stringify(this.formBinance.getRawValue()),
      );
    }

    this.sendRequests();
  }

  sleep(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getRandomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}
