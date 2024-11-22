import { formatTransactionDate } from "../../../utils/dayjs";
import { descriptionToTags } from "../../description";
import { CSVFormatParser, Transaction } from "../../parser.types";

export const isHSBCCard = (parseResult: Papa.ParseResult<any>) => {
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
      amount: parseFloat(data[2]) * -1,
      description,
      transactionMethod: transactionMethod,
      transactionType: transactionType,
    };
  });
};
