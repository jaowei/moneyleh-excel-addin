export type Transaction = {
  date: string;
  transactionTag: string;
  company: string;
  account: string;
  currency: string;
  amount: number;
  description: string;
  transactionMethod: string;
  transactionType?: string;
};

export type CSVFormatParser = (
  parsedContent: Papa.ParseResult<any>,
  accountName: string,
  companyName: string
) => Transaction[];
