export interface Withdrawal {
  code: string;
  msg: string;
  data: [
    {
      amt: string;
      wdId: string;
      ccy: string;
      clientId: string;
      chain: string;
    },
  ];
}
