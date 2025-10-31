export interface Transaction {
  id: string;
  arrangementId: string | null;
  transactionId: string | null;
  reference: string | null;
  description: string[];
  bookingDate: string;
  amount: number;
  currency: string | null;
  creditDebitIndicator: 'CREDIT' | 'DEBIT'; 
  transactionCode: string;
  instructedCurrency: string | null;
  transactionAmountCurrency: string | null;
  transactionOffsetKey: string;
  instructedAmountCurrency: string | null;
  currencyExchangeRate: number | null;
  billingStatus: string | null;
  checkSerialNumber: string | null;
  notes: string | null;
  runningBalance: string;
  isLink: boolean;
  linkParams: any | null;
  isForeignCurrency: boolean;
  interac: any | null;
  merchantName: string | null;
  merchantCity: string | null;
  interestRate: number | null;
  pwpEligible: boolean;
  merchantProvince: string | null;
  posEntryMode: string | null;
  postedDate: string | null;
  postedTime: string | null;
  conversionRate: number | null;
  originalTransactionAmount: number | null;
  isIntradayTransaction: boolean;
  isDisputable: boolean;
  additions: Record<string, any>;
}

/**
 * Interface for the root level of the transaction API response.
 */
export interface RbcApiResponse {
  transactionList: Transaction[];
  asOfDate: string;
  startDate: string;
  endDate: string;
  totalMatches: number;
  totalResultsReturned: number;
  authorizedTotal: number | null;
  availableCredit: number | null;
  hasError: boolean;
  errorLevel: string | null;
  errorDescription: string | null;
  additions: Record<string, any>;
}