export type Amount = {
  currencyCode: string;
  amount: number;
}

export type Merchant = {
  name: string;
  categoryCode: string | null;
  category: string | null;
  countryCode: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  website: string | null;
  customerServicePageUrl: string | null;
  facebookPageUrl: string | null;
  twitterPageUrl: string | null;
  merchantImageRef: string | null;
}

export type Category = {
  code: string;
  description: string;
}

export type Transaction = {
  key: string;
  id: string;
  postedDate: string | null;
  description: string;
  subDescription: string | null;
  cleanDescription: string;
  typeCode: string;
  mnemonicCode: string;
  tsysCode: string | null;
  isTsys: boolean;
  isDisputable: 'DISPUTABLE' | 'NOT_DISPUTABLE';
  originalAmount: Amount;
  runningBalance: Amount;
  associatedCardNumber: string | null;
  purchaseCountryCode: string | null;
  outOfCountryIndicator: boolean;
  referenceNumber: string;
  reasonCode: string | null;
  status: string | null;
  recurringPaymentIndicator: string | null;
  directionIndicator: 'DEBIT' | 'CREDIT';
  statementIndicator: string | null;
  fromAccount: string | null;
  toAccount: string | null;
  purchaseType: string | null;
  rewardsCategory: string | null;
  rewardCard: string | null;
  category: Category;
  userInputTag: string | null;
  cheque: string | null;
  merchant: Merchant;
  enriched: boolean;
  acquirerReferenceNumber: string | null;
  transactionId: string;
  transactionDate: string;
  balance: Amount;
  transactionKey: string;
  transactionAmount: Amount;
  transactionCategory: string | null;
  transactionCategoryCode: string;
  transactionType: 'DEBIT' | 'CREDIT';
  remittanceType: string | null;
  transactionTypeCode: string;
  descriptionLine1: string;
  descriptionLine2: string | null;
}

export type ChequingApiResponse = {
  data: Transaction[];
  notifications: unknown;
}

export type ScenePlusApiResponse = {
  data: {
    pending: unknown[];
    settled: Transaction[];
  }
  notifcations: unknown;
};
