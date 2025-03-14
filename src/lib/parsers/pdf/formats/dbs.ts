import { descriptionToTags } from "../../description";
import { isTextItem, PDFFormatChecker, PDFFormatParser, Transaction } from "../../parser.types";
import { isInSameRow } from "../pdfParser";
import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import dayjs from "dayjs";

export const isDBSCardFormat: PDFFormatChecker = (data) => {
  const cardName = data?.at(35);
  if (cardName && isTextItem(cardName)) {
    return cardName.str.includes("DBS");
  }
  return false;
};

const filterTextData = (text: string): boolean => {
  if (!text || text === " " || text.length > 80 || text.includes("NEW TRANSACTIONS")) {
    return true;
  }
  return false;
};

const isCardName = (text: string): string | undefined => {
  if (text.includes("CARD NO.: ")) {
    return text.substring(0, text.length - 25);
  }
  return;
};

const getStatementDate = (text: string): dayjs.Dayjs | undefined => {
  const convertedDate = extendedDayjs(text, "DD MMM YYYY");
  if (convertedDate.isValid()) {
    return convertedDate;
  }
  return;
};

const extractAmount = (row: Array<string> | string) => {
  const lastItem = row.at(-1)?.replace(",", "");
  let parsedAmount = parseFloat(lastItem ?? "0.0") * -1;
  if (lastItem === "CR") {
    const secondLastItem = row.at(-2)?.replace(",", "");
    parsedAmount = parseFloat(secondLastItem ?? "0.0");
  } else if (Number.isNaN(parsedAmount)) {
    return undefined;
  }
  return parsedAmount;
};

const extractDate = (row: Array<string> | string, statementDate: dayjs.Dayjs | undefined) => {
  const transactionDate = row.at(0);
  const year = statementDate?.year();
  // handle Jan statement transactions that are from previous year
  if (statementDate?.month() === 0 && transactionDate?.toLowerCase().includes("dec")) {
    const dateWithYear = year ? transactionDate + (year - 1).toString() : transactionDate;
    return formatTransactionDate(dateWithYear, "DD MMMYYYY");
  }
  const dateWithYear = year ? transactionDate + year.toString() : transactionDate;
  return formatTransactionDate(dateWithYear, "DD MMMYYYY");
};

const parseAppRow = (data: {
  row: string[];
  statementDate: dayjs.Dayjs | undefined;
  accountName: string;
  companyName: string;
}): Transaction | undefined => {
  const { row, statementDate, accountName, companyName } = data;
  const parsedAmount = extractAmount(row);
  if (!parsedAmount) return undefined;

  const date = extractDate(row, statementDate);

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
  let statementDate;
  let headerCoord = 0;
  let prevIdx: number = 0;
  let row: Array<string> = [];
  let result: Array<Transaction> = [];
  // TODO: Will always be overriden for now, determine proper fallback approach here
  let baseAccountName = accountName;

  for (let i = 0; i < textData.length; i++) {
    const prevData = textData[prevIdx];
    const data = textData[i];
    if (!isTextItem(data) || !isTextItem(prevData)) continue;
    const text = data.str;

    if (filterTextData(text)) continue;

    if (!statementDate) statementDate = getStatementDate(text);

    const cardName = isCardName(text);
    if (cardName) {
      baseAccountName = cardName;
    }

    if (text === "PREVIOUS BALANCE") {
      headerCoord = data.transform[5];
    }

    // stops below code from running until header is found
    if (headerCoord === 0) continue;

    // Stop processing
    if (text.includes("GRAND TOTAL FOR ALL CARD ACCOUNTS:")) break;

    const prevCoord = prevData.transform[5];
    const currentCoord = data.transform[5];

    // is in same row
    if (isInSameRow(prevCoord, currentCoord)) {
      row.push(text);
    } else {
      if (row.length >= 3) {
        const parsedData = parseAppRow({
          row,
          statementDate,
          accountName: baseAccountName,
          companyName,
        });
        if (parsedData) result.push(parsedData);
      }
      row = [text];
    }

    prevIdx = i;
  }

  return result;
};
