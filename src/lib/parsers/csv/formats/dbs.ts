import { extendedDayjs, formatTransactionDate } from "../../../utils/dayjs";
import { descriptionToTags } from "../../description";
import { CSVFormatChecker, CSVFormatParser, Transaction } from "../../parser.types";

const keywordsParentTagMap = new Map([
  ["PAYLAH", "Paylah"],
  ["BILL CCC", "Creditcard"],
  ["PayNow", "Paynow"],
]);

export const isDBSAccountFormat: CSVFormatChecker = (parseResult) => {
  const accountDetails = parseResult.data[0][1];
  const res = accountDetails.match(/^DBS.*\d$/g);
  if (!res) {
    return false;
  }
  return true;
};

const parseDBSNAVDescription = (description: string) => {
  const accountStartIdx = description.lastIndexOf(":");
  const accountNumber = description.slice(accountStartIdx + 2).trim();
  let childTag = null;
  let parentTag = null;

  for (let keyword of keywordsParentTagMap.keys()) {
    if (description.includes(keyword)) {
      parentTag = keywordsParentTagMap.get(keyword);
    }
  }

  return {
    accountNumber,
    parentTag,
    childTag,
  };
};

export const parseDBSAppFormat: CSVFormatParser = (parsedContent, accountName, companyName) => {
  let currency = "SGD";
  return parsedContent.data.reduce((prev: Array<Transaction>, curr: Array<string>) => {
    if (curr[0] === "Currency:") {
      currency = curr[1].slice(0, 4);
    }
    if (extendedDayjs(curr[0], "D MMM YYYY").isValid()) {
      let amount = 0;
      const debitAmt = curr.at(4)?.trim();
      const creditAmt = curr.at(5)?.trim();
      if (debitAmt) {
        amount = parseFloat(debitAmt) * -1;
      } else if (creditAmt) {
        amount = parseFloat(creditAmt);
      }
      const description = curr.slice(-4, -1).join(" ");
      const { transactionMethod, transactionType } = descriptionToTags(description);
      prev.push({
        date: formatTransactionDate(curr[0], "D-MMM-YYYY") ?? "",
        transactionTag: "",
        company: companyName,
        account: accountName,
        currency,
        amount,
        description,
        transactionMethod,
        transactionType,
      });
    }
    return prev;
  }, []);
};

export const parseDBSNAVAppFormat: CSVFormatParser = (parsedContent, accountName, companyName) => {
  return parsedContent.data.reduce((prev: Array<Transaction>, curr: Array<string>) => {
    if (extendedDayjs(curr[0], "YYYY-MM-DD").isValid()) {
      let amount;
      if (curr[2] === "Money Out") {
        amount = parseFloat(curr?.at(-1) ?? "0") * -1;
      } else {
        amount = parseFloat(curr?.at(-1) ?? "0");
      }

      const cleanDescription = curr[5].trimEnd();

      const parsedDescription = parseDBSNAVDescription(cleanDescription);

      prev.push({
        date: curr[0],
        transactionTag: "",
        company: companyName,
        account: accountName,
        currency: "SGD",
        amount,
        description: cleanDescription,
        transactionMethod: curr[1],
        transactionType: parsedDescription.parentTag ?? curr[3],
      });
    }
    return prev;
  }, []);
};
