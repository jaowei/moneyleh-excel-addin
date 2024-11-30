import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import { CSVFormatChecker, CSVFormatParser, Transaction } from "../../parser.types";
import { TransactionMethods } from "../../transactionMethods";
import { TransactionTypes } from "../../transactionTypes";

export const isIBKRFormat: CSVFormatChecker = (data) => {
  const companyName = data.data[0][0];
  return companyName.includes("BOF");
};

const reportSelector = (code: string) => {
  switch (code) {
    case "STFU":
      return {
        isReport: true,
        format(row: string[], accountName: string, companyName: string): Transaction | undefined {
          if (!row[0].includes("U***")) return;
          return {
            date: formatTransactionDate(row[29], "YYYYMMDD") ?? "",
            transactionTag: "",
            company: companyName,
            account: accountName,
            currency: row[3],
            amount: parseFloat(row[43]),
            description: row[31],
            transactionMethod: TransactionMethods.transfer.name,
            transactionType: TransactionTypes.investments,
          };
        },
      };
    case "STAX":
      return {
        isReport: true,
        format(row: string[], accountName: string, companyName: string): Transaction | undefined {
          if (!row[0].includes("U***")) return;
          return {
            date: formatTransactionDate(row[24], "YYYYMMDD") ?? "",
            transactionTag: "Investment GST",
            company: companyName,
            account: accountName,
            currency: row[3],
            amount: parseFloat(row[31]),
            description: row[28],
            transactionMethod: TransactionMethods.transfer.name,
            transactionType: TransactionTypes.investments,
          };
        },
      };
    case "UNBC":
      return {
        isReport: true,
        format(row: string[], accountName: string, companyName: string): Transaction | undefined {
          if (!row[0].includes("U***")) return;
          const dateTime = row[24].split(";");
          return {
            date: formatTransactionDate(dateTime[0], "YYYYMMDD;") ?? "",
            transactionTag: "Investment Commission",
            company: companyName,
            account: accountName,
            currency: row[3],
            amount: parseFloat(row[31]),
            description: row[7] + " " + row[25],
            transactionMethod: TransactionMethods.transfer.name,
            transactionType: TransactionTypes.investments,
          };
        },
      };
    case "CNAV":
      return {
        isReport: true,
        format(row: string[], _: string, companyName: string): Transaction | undefined {
          if (!row[0].includes("U***")) return;
          return {
            date: formatTransactionDate(row[4], "YYYYMMDD") ?? "",
            transactionTag: "",
            company: companyName,
            account: "Securities",
            currency: "SGD",
            amount: parseFloat(row[6]),
            description: "Mark to market",
            transactionMethod: TransactionMethods.transfer.name,
            transactionType: TransactionTypes.investments,
          };
        },
      };
    default:
      return {
        isReport: false,
      };
  }
};

export const parseIBKRFormat: CSVFormatParser = (data, accountName, companyName) => {
  let start = false;
  let formatter;
  const result: Array<Transaction> = [];

  for (const row of data.data) {
    const { isReport, format } = reportSelector(row[1]);
    if (row[0] === "BOS" && isReport) {
      start = true;
      formatter = format;
      continue;
    }

    if (row[0] === "EOS") {
      start = false;
      continue;
    }

    if (!start) continue;

    const transaction = formatter?.(row, accountName, companyName);
    if (!transaction) continue;
    result.push(transaction);
  }
  return result;
};
