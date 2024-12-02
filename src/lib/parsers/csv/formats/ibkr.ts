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
        format(row: string[], _: string, companyName: string): Transaction | undefined {
          if (!row[0].includes("U***")) return;
          return {
            date: formatTransactionDate(row[29], "YYYYMMDD") ?? "",
            transactionTag: "",
            company: companyName,
            account: "Cash Account",
            currency: row[3],
            amount: parseFloat(row[43]) - parseFloat(row[39]) - parseFloat(row[40]),
            description: row[31],
            transactionMethod: TransactionMethods.transfer.name,
            transactionType: TransactionTypes.investments,
          };
        },
      };
    case "STAX":
      return {
        isReport: true,
        format(row: string[], _: string, companyName: string): Transaction | undefined {
          if (!row[0].includes("U***")) return;
          return {
            date: formatTransactionDate(row[24], "YYYYMMDD") ?? "",
            transactionTag: "Investment GST",
            company: companyName,
            account: "Cash Account",
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
        format(row: string[], _: string, companyName: string): Transaction | undefined {
          if (!row[0].includes("U***")) return;
          const dateTime = row[24].split(";");
          return {
            date: formatTransactionDate(dateTime[0], "YYYYMMDD;") ?? "",
            transactionTag: row[25] === "IDEALFX" ? "FX Commission" : "Investment Commission",
            company: companyName,
            account: "Cash Account",
            currency: row[3],
            amount: parseFloat(row[31]),
            description: row[7] + " " + row[25],
            transactionMethod: TransactionMethods.transfer.name,
            transactionType: TransactionTypes.investments,
          };
        },
      };
    case "EQUT":
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
            amount: parseFloat(row[20]),
            description: "Mark to market",
            transactionMethod: TransactionMethods.transfer.name,
            transactionType: TransactionTypes.investments,
          };
        },
        onEnd(result: Array<Transaction>) {
          const first = result[0];
          const last = result.at(-1);
          if (last) {
            const aggregatedNav = {
              ...last,
              amount: (last?.amount ?? 0) - first.amount,
            };
            return [aggregatedNav];
          }
          return result;
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
  let result: Array<Transaction> = [];

  for (const row of data.data) {
    const { isReport, format, onEnd } = reportSelector(row[1]);
    if (row[0] === "BOS" && isReport) {
      start = true;
      formatter = format;
      continue;
    }

    if (row[0] === "EOS") {
      start = false;
      result = onEnd?.(result) ?? result;
      continue;
    }

    if (!start) continue;

    const transaction = formatter?.(row, accountName, companyName);
    if (!transaction) continue;
    result.push(transaction);
  }
  return result;
};
