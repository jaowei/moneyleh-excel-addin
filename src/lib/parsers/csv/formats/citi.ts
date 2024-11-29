import { formatTransactionDate } from "../../../utils/dayjs";
import { descriptionToTags } from "../../description";
import { CSVFormatChecker, CSVFormatParser } from "../../parser.types";

export const isCitiCardFormat: CSVFormatChecker = (data) => {
  const res = data.data[0][4].match(/('\d*')/g);
  if (!res) {
    return false;
  }
  return true;
};

export const parseCitiCardFormat: CSVFormatParser = (data, accountName, companyName) => {
  return data.data.map((data: string[]) => {
    const description = data[1];
    const { transactionMethod, transactionType } = descriptionToTags(description);
    return {
      date: formatTransactionDate(data[0], "DD/M/YYYY") ?? "",
      transactionTag: "",
      company: companyName,
      account: accountName,
      currency: "SGD",
      amount: parseFloat(data[2]),
      description,
      transactionMethod: transactionMethod,
      transactionType: transactionType,
    };
  });
};
