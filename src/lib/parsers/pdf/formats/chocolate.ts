import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import { isTextItem, PDFFormatChecker, PDFFormatParser } from "../../parser.types";
import { TransactionMethods } from "../../transactionMethods";
import { TransactionTypes } from "../../transactionTypes";
import { genericPDFDataExtractor } from "../pdfParser";

export const isChocolateFormat: PDFFormatChecker = (data) => {
  const companyName = data?.at(2);
  if (companyName && isTextItem(companyName)) {
    return companyName.str.includes("www.chocolatefinance.com");
  }
  return false;
};

const filterChocolateData = (text: string) => {
  if (!text) {
    return true;
  }
  return false;
};

const extractChocolateYear = (text: string) => {
  if (extendedDayjs(text, "D MM YYYY - D MM YYYY").isValid()) {
    return text.slice(-1, -5);
  }
  return "";
};

const startChocolateExtraction = (text: string) => {
  return text === "transaction";
};

const stopChocolateExtraction = (text: string) => {
  return text.includes("www.chocolatefinance.com");
};

const formatChoclateRow = (row: string[], year: string, accountName: string, companyName: string) => {
  let amount = 0;
  if (row[4]) {
    amount = parseFloat(row[4].slice(2).replace(",", ""));
  } else if (row[5]) {
    amount = parseFloat(row[5].slice(2).replace(",", "")) * -1;
  }

  return {
    date: formatTransactionDate(row[0], "DD MM") + year,
    transactionTag: "",
    company: companyName,
    account: accountName,
    currency: "SGD",
    amount,
    description: row[2],
    transactionMethod: TransactionMethods.transfer.name,
    transactionType: TransactionTypes.savings,
  };
};

const shouldFormatRow = (row: string[]) => {
  return row.length >= 3;
};

export const parseChocolateFormat: PDFFormatParser = (data, accountName, companyName) => {
  return genericPDFDataExtractor(
    data,
    accountName,
    companyName,
    filterChocolateData,
    extractChocolateYear,
    startChocolateExtraction,
    stopChocolateExtraction,
    formatChoclateRow,
    shouldFormatRow
  );
};
