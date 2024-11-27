import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

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

export const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem => {
  return (item as TextItem).width !== undefined;
};

export type PDFFormatChecker = (data?: Array<TextItem | TextMarkedContent>) => boolean;

export type PDFFormatParser = (
  parsedContent: Array<TextItem | TextMarkedContent>,
  accountName: string,
  companyName: string
) => Transaction[];

export type XLSFormatParser = (parsedContent: Array<any>, accountName: string, companyName: string) => Transaction[];
