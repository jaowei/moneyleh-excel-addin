import { descriptionToTags } from "../../description";
import { isTextItem, PDFFormatChecker, PDFFormatParser, Transaction } from "../../parser.types";
import { isInSameRow } from "../pdfParser";
import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";

export const isDBSCardFormat: PDFFormatChecker = (data) => {
  const cardName = data?.at(35);
  if (cardName && isTextItem(cardName)) {
    return cardName.str.includes("DBS");
  }
  return false;
};

const filterTextData = (text: string): boolean => {
  if (!text || text === " " || text.length > 40 || text.includes("NEW TRANSACTIONS")) {
    return true;
  }
  return false;
};

const getYear = (text: string): string => {
  const textLen = text.length;
  if (extendedDayjs(text, "DD MMM YYYY").isValid()) {
    return text.slice(textLen - 4);
  }
  return "";
};

const extractAmount = (row: Array<string> | string) => {
  const lastItem = row.at(-1)?.replace(",", "");
  let parsedAmount = parseFloat(lastItem ?? "0.0") * -1;
  if (lastItem === "CR") {
    const secondLastItem = row.at(-2)?.replace(",", "");
    parsedAmount = parseFloat(secondLastItem ?? "0.0");
  }
  return parsedAmount;
};

const extractDate = (row: Array<string> | string, year: string) => {
  const rawString = year ? row.at(0) + year : row.at(0);
  return formatTransactionDate(rawString, "DD MMMYYYY");
};

const parseAppRow = (data: { row: string[]; year: string; accountName: string; companyName: string }): Transaction => {
  const { row, year, accountName, companyName } = data;
  const parsedAmount = extractAmount(row);

  const date = extractDate(row, year);

  const description = row.at(1) ?? "";

  const { transactionMethod, transactionType } = descriptionToTags(description);

  return {
    date: date ?? "",
    transactionTag: "",
    company: companyName,
    account: accountName,
    currency: "SGD",
    amount: parsedAmount,
    description: row.at(1) ?? "",
    transactionMethod,
    transactionType,
  };
};

export const parseDBSFormat: PDFFormatParser = (textData, accountName, companyName) => {
  if (!textData) return [];
  let statementYear: string = "";
  let headerCoord = 0;
  let prevIdx: number = 0;
  let row: Array<string> = [];
  let result: Array<Transaction> = [];

  for (let i = 0; i < textData.length; i++) {
    const prevData = textData[prevIdx];
    const data = textData[i];
    if (!isTextItem(data) || !isTextItem(prevData)) continue;
    const text = data.str;

    if (filterTextData(text)) continue;

    if (!statementYear) statementYear = getYear(text);

    if (text === "PREVIOUS BALANCE") {
      headerCoord = data.transform[5];
    }

    // stops below code from running until header is found
    if (headerCoord === 0) continue;

    // Stop processing
    if (text === "TOTAL:") break;

    const prevCoord = prevData.transform[5];
    const currentCoord = data.transform[5];

    // is in same row
    if (isInSameRow(prevCoord, currentCoord)) {
      row.push(text);
    } else {
      if (row.length >= 3) {
        const parsedData = parseAppRow({
          row,
          year: statementYear,
          accountName,
          companyName,
        });
        result.push(parsedData);
      }
      row = [text];
    }

    prevIdx = i;
  }

  return result;
};
