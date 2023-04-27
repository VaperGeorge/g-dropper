export interface CoinData {
  coin: string;
  depositAllEnable: boolean;
  free: string;
  freeze: string;
  ipoable: string;
  ipoing: string;
  isLegalMoney: boolean;
  locked: string;
  name: string;
  networkList: Network[];
  storage: string;
  trading: boolean;
  withdrawAllEnable: boolean;
  withdrawing: string;
}

export interface Network {
  addressRegex: string;
  coin: string;
  depositDesc?: string;
  depositEnable: boolean;
  isDefault: boolean;
  memoRegex: string;
  minConfirm: number;
  name: string;
  network: string;
  resetAddressStatus: boolean;
  specialTips: string;
  unLockConfirm: number;
  withdrawDesc?: string;
  withdrawEnable: boolean;
  withdrawFee: string;
  withdrawIntegerMultiple: string;
  withdrawMax: string;
  withdrawMin: string;
  sameAddress: boolean;
  estimatedArrivalTime: number;
  busy: boolean;
}

export interface CoinDataList {
  data: CoinData[];
}
