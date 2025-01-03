import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import { descriptionToTags } from "../../description";
import { isTextItem, PDFFormatChecker, PDFFormatParser } from "../../parser.types";
import { genericPDFDataExtractor } from "../pdfParser";

export const isTrustCardFormat: PDFFormatChecker = (data) => {
  const bankName = data?.[0];
  if (bankName && isTextItem(bankName)) {
    return bankName.str.includes("Trust Bank Singapore");
  }
  return false;
};

const filterTrustCardFormat = (text: string) => {
  return !text;
};

const getTrustCardYear = (text: string) => {
  const date = extendedDayjs(text, "D MMM YYYY");
  if (date.isValid()) {
    return date.year().toString();
  }
  return "";
};

const startExtractionTrustCard = (text: string) => {
  return text === "Amount in SGD";
};

const stopExtractionTrustCard = (text: string) => {
  return text === "Total outstanding balance";
};

const formatTrustCardRow = (row: string[], statementYear: string, accountName: string, companyName: string) => {
  const isShortRow = row.length === 5;
  let amount = 0;
  if (isShortRow) {
    amount = parseFloat(row[4].replace("+", "").replace(",", ""));
  } else {
    amount = parseFloat(row[7].replace(",", "")) * -1;
  }
  const description = isShortRow ? row[2] : row.slice(2, 7).join("_");
  const { transactionMethod, transactionType } = descriptionToTags(description);
  return {
    date: formatTransactionDate(row[0] + statementYear, "DD MMMYYYY") ?? row[0],
    transactionTag: "",
    company: companyName,
    account: accountName,
    currency: "SGD",
    amount,
    description,
    transactionMethod,
    transactionType,
  };
};

const shouldFormatRow = (row: string[]) => {
  return row.length > 1 && extendedDayjs(row[0], "DD MMM").isValid() && !row[2].includes("balance");
};

export const parseTrustCardFormat: PDFFormatParser = (data, accountName, companyName) => {
  return genericPDFDataExtractor(
    data,
    accountName,
    companyName,
    filterTrustCardFormat,
    getTrustCardYear,
    startExtractionTrustCard,
    stopExtractionTrustCard,
    formatTrustCardRow,
    shouldFormatRow
  );
};
