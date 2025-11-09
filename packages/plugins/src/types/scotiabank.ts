export type ScotiabankAmount = {
  currencyCode: string;
  amount: number;
};

export type ScotiabankMerchant = {
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
};

export type ScotiabankCategory = {
  code: string;
  description: string;
};

export type ScotiabankTransaction = {
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
  isDisputable: "DISPUTABLE" | "NOT_DISPUTABLE";
  originalAmount: ScotiabankAmount;
  runningBalance: ScotiabankAmount;
  associatedCardNumber: string | null;
  purchaseCountryCode: string | null;
  outOfCountryIndicator: boolean;
  referenceNumber: string;
  reasonCode: string | null;
  status: string | null;
  recurringPaymentIndicator: string | null;
  directionIndicator: "DEBIT" | "CREDIT";
  statementIndicator: string | null;
  fromAccount: string | null;
  toAccount: string | null;
  purchaseType: string | null;
  rewardsCategory: string | null;
  rewardCard: string | null;
  category: ScotiabankCategory;
  userInputTag: string | null;
  cheque: string | null;
  merchant: ScotiabankMerchant;
  enriched: boolean;
  acquirerReferenceNumber: string | null;
  transactionId: string;
  transactionDate: string;
  balance: ScotiabankAmount;
  transactionKey: string;
  transactionAmount: ScotiabankAmount;
  transactionCategory: string | null;
  transactionCategoryCode: string;
  transactionType: "DEBIT" | "CREDIT";
  remittanceType: string | null;
  transactionTypeCode: string;
  descriptionLine1: string;
  descriptionLine2: string | null;
};

export type ChequingApiResponse = {
  data: ScotiabankTransaction[];
  notifications: unknown;
};

export type ScenePlusApiResponse = {
  data: {
    pending: unknown[];
    settled: ScotiabankTransaction[];
  };
  notifcations: unknown;
};
