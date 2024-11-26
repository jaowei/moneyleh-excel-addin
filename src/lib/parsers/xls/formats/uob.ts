import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import { descriptionToTags } from "../../description";
import { Transaction, XLSFormatParser } from "../../parser.types";

export const isUOBCardFormat = (parsedContent: Array<any>) => {
  return parsedContent[0][0].includes("United Overseas Bank");
};

export const parseUOBFormat: XLSFormatParser = (parsedContent, accountName, companyName) => {
  return parsedContent.reduce((prev: Array<Transaction>, curr: Array<string>) => {
    if (extendedDayjs(curr[0], "DD MMM YYYY").isValid()) {
      const description = curr[2].replace(/\n|\r/g, "");
      const { transactionMethod, transactionType } = descriptionToTags(description);
      prev.push({
        date: formatTransactionDate(curr[0], "DD MMM YYYY") ?? "",
        transactionTag: "",
        company: companyName,
        account: accountName,
        currency: curr[5],
        amount: parseFloat(curr?.at(-1) ?? "0") * -1,
        description,
        transactionMethod: transactionMethod,
        transactionType: transactionType,
      });
    }
    return prev;
  }, []);
};
