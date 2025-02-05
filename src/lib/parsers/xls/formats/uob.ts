import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import { descriptionToTags } from "../../description";
import { Transaction, XLSFormatChecker, XLSFormatParser } from "../../parser.types";

export const isUOBCardFormat: XLSFormatChecker = (parsedContent) => {
  const bankName = parsedContent[0][0];
  const statementType = parsedContent[5][1];
  const statementPeriod = parsedContent[6][0];
  const isCardStatement = statementPeriod === "Statement Date:" || statementType.includes("CARD");
  return bankName.includes("United Overseas Bank") && isCardStatement;
};

export const isUOBAccountFormat: XLSFormatChecker = (parsedContent) => {
  const bankName = parsedContent[0][0];
  const statementType = parsedContent[5][1];
  return bankName.includes("United Overseas Bank") && statementType.includes("Account");
};

export const parseUOBCardFormat: XLSFormatParser = (parsedContent, accountName, companyName) => {
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

export const parseUOBAccountFormat: XLSFormatParser = (parsedContent, accountName, companyName) => {
  return parsedContent.reduce((prev: Array<Transaction>, curr: Array<string>) => {
    if (extendedDayjs(curr[0], "DD MMM YYYY").isValid()) {
      const description = curr[1].replace(/\n|\r/g, "");
      const { transactionMethod, transactionType } = descriptionToTags(description);
      const withdrawAmt = parseFloat(curr[2]);
      const depositAmt = parseFloat(curr[3]);
      let amount = 0;
      if (withdrawAmt === 0 && depositAmt > 0) {
        amount = depositAmt;
      } else if (withdrawAmt > 0 && depositAmt === 0) {
        amount = withdrawAmt * -1;
      }
      prev.push({
        date: formatTransactionDate(curr[0], "DD MMM YYYY") ?? "",
        transactionTag: "",
        company: companyName,
        account: accountName,
        currency: "SGD",
        amount,
        description,
        transactionMethod: transactionMethod,
        transactionType: transactionType,
      });
    }
    return prev;
  }, []);
};
