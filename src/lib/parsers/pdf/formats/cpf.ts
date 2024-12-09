import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import { isTextItem, PDFFormatChecker, PDFFormatParser } from "../../parser.types";
import { TransactionMethods } from "../../transactionMethods";
import { TransactionTypes } from "../../transactionTypes";
import { genericPDFDataExtractor } from "../pdfParser";

export const isCPFFormat: PDFFormatChecker = (data) => {
  const cpfNumber = data?.at(-4);
  if (cpfNumber && isTextItem(cpfNumber)) {
    return cpfNumber.str.includes("CPF Account Number");
  }
  return false;
};

const filterCPFData = (text: string) => {
  return !text;
};

const getCPFYear = (text: string) => {
  if (extendedDayjs(text.slice(5, 16), "DD MMM YYYY").isValid()) {
    return text.slice(-5).replace(")", "");
  }
  return "";
};

const startCPFExtraction = (text: string) => {
  return text.includes("(For");
};

const stopCPFExtraction = (text: string) => {
  return text.includes("A :");
};

const extractAmount = (data: string) => {
  return parseFloat(data.replace(",", ""));
};

const formatCPFRow = (row: string[], year: string, _: string, companyName: string) => {
  const isShortRow = row.length === 9;
  console.log(year);
  const date = formatTransactionDate(row[0], "DD MM YYYY") + year;
  const transactionTag = "";
  const company = companyName;
  const currency = "SGD";
  const description = row[2];
  const transactionMethod = TransactionMethods.transfer.name;
  const transactionType = TransactionTypes.savings;
  const oaAmt = extractAmount(isShortRow ? row[4] : row[8]);
  const saAmt = extractAmount(isShortRow ? row[6] : row[10]);
  const maAmt = extractAmount(isShortRow ? row[8] : row[12]);
  return [
    ...(oaAmt
      ? [
          {
            date,
            transactionTag,
            company,
            account: "OA",
            currency,
            amount: oaAmt,
            description,
            transactionMethod,
            transactionType,
          },
        ]
      : []),
    ...(saAmt
      ? [
          {
            date,
            transactionTag,
            company,
            account: "SA",
            currency,
            amount: saAmt,
            description,
            transactionMethod,
            transactionType,
          },
        ]
      : []),
    ...(maAmt
      ? [
          {
            date,
            transactionTag,
            company,
            account: "MA",
            currency,
            amount: maAmt,
            description,
            transactionMethod,
            transactionType,
          },
        ]
      : []),
  ];
};

const shouldFormatRow = (row: string[]) => {
  return row.length >= 6 && row[2] !== "BAL";
};

export const parseCPFFormat: PDFFormatParser = (data, accountName, companyName) => {
  return genericPDFDataExtractor(
    data,
    accountName,
    companyName,
    filterCPFData,
    getCPFYear,
    startCPFExtraction,
    stopCPFExtraction,
    formatCPFRow,
    shouldFormatRow
  );
};
