import { formatTransactionDate } from "../../../utils/dayjs";
import { descriptionToTags } from "../../description";
import { CSVFormatChecker, CSVFormatParser, Transaction } from "../../parser.types";

export const isHSBCCard: CSVFormatChecker = (parseResult) => {
  return parseResult.data[0][1].includes("•");
};

export const parseHSBCFormat: CSVFormatParser = (parsedContent, accountName, companyName): Array<Transaction> => {
  return parsedContent.data.map((data: string[]) => {
    const description = data[1];
    const { transactionMethod, transactionType } = descriptionToTags(description);
    return {
      date: formatTransactionDate(data[0], "DD/M/YYYY") ?? "",
      transactionTag: "",
      company: companyName,
      account: accountName,
      currency: description.slice(-3),
      amount: parseFloat(data[2].replace(",", "")),
      description,
      transactionMethod: transactionMethod,
      transactionType: transactionType,
    };
  });
};
